import sha256 from 'hash.js/lib/hash/sha/256';
import MagicString, { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import * as NodeType from './ast/nodes/NodeType';
import { UNDEFINED_EXPRESSION } from './ast/values';
import ExportDefaultVariable, {
	isExportDefaultVariable
} from './ast/variables/ExportDefaultVariable';
import ExportShimVariable from './ast/variables/ExportShimVariable';
import GlobalVariable from './ast/variables/GlobalVariable';
import LocalVariable from './ast/variables/LocalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import Variable from './ast/variables/Variable';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import Graph from './Graph';
import Module from './Module';
import {
	GlobalsOption,
	OutputOptions,
	RawSourceMap,
	RenderedChunk,
	RenderedModule
} from './rollup/types';
import { Addons } from './utils/addons';
import { toBase64 } from './utils/base64';
import collapseSourcemaps from './utils/collapseSourcemaps';
import { deconflictChunk } from './utils/deconflictChunk';
import { error } from './utils/error';
import { sortByExecutionOrder } from './utils/executionOrder';
import getIndentString from './utils/getIndentString';
import { makeLegal } from './utils/identifierHelpers';
import { basename, dirname, isAbsolute, normalize, relative, resolve } from './utils/path';
import relativeId, { getAliasName } from './utils/relativeId';
import renderChunk from './utils/renderChunk';
import { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { RESERVED_NAMES } from './utils/reservedNames';
import { sanitizeFileName } from './utils/sanitizeFileName';
import { timeEnd, timeStart } from './utils/timers';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

export interface ModuleDeclarations {
	dependencies: ModuleDeclarationDependency[];
	exports: ChunkExports;
}

export interface ModuleDeclarationDependency {
	// these used as interop signifiers
	exportsDefault: boolean;
	exportsNames: boolean;
	globalName: string;
	id: string;
	imports?: ImportSpecifier[];
	isChunk: boolean;
	name: string;
	namedExportsMode: boolean;
	reexports?: ReexportSpecifier[];
}

export type ChunkDependencies = ModuleDeclarationDependency[];

export type ChunkExports = {
	exported: string;
	hoisted: boolean;
	local: string;
	uninitialized: boolean;
}[];

export interface ReexportSpecifier {
	imported: string;
	needsLiveBinding: boolean;
	reexported: string;
}

export interface ImportSpecifier {
	imported: string;
	local: string;
}

function getGlobalName(
	module: ExternalModule,
	globals: GlobalsOption,
	graph: Graph,
	hasExports: boolean
) {
	let globalName: string | undefined;
	if (typeof globals === 'function') {
		globalName = globals(module.id);
	} else if (globals) {
		globalName = globals[module.id];
	}

	if (globalName) {
		return globalName;
	}

	if (hasExports) {
		graph.warn({
			code: 'MISSING_GLOBAL_NAME',
			guess: module.variableName,
			message: `No name was provided for external module '${
				module.id
			}' in output.globals – guessing '${module.variableName}'`,
			source: module.id
		});
		return module.variableName;
	}
}

export function isChunkRendered(chunk: Chunk): boolean {
	return !chunk.isEmpty || chunk.entryModules.length > 0 || chunk.manualChunkAlias !== null;
}

export default class Chunk {
	entryModules: Module[] = [];
	execIndex: number;
	exportMode = 'named';
	facadeModule: Module | null = null;
	graph: Graph;
	hasDynamicImport = false;
	id: string = undefined;
	indentString: string = undefined;
	isEmpty: boolean;
	manualChunkAlias: string | null = null;
	orderedModules: Module[];
	renderedModules: {
		[moduleId: string]: RenderedModule;
	};
	usedModules: Module[] = undefined;
	variableName: string;

	private chunkName: string | void;
	private dependencies: (ExternalModule | Chunk)[] = undefined;
	private dynamicDependencies: (ExternalModule | Chunk)[] = undefined;
	private exportNames: { [name: string]: Variable } = Object.create(null);
	private exports = new Set<Variable>();
	private imports = new Set<Variable>();
	private needsExportsShim = false;
	private renderedDeclarations: {
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	} = undefined;
	private renderedHash: string = undefined;
	private renderedModuleSources: MagicString[] = undefined;
	private renderedSource: MagicStringBundle | null = null;
	private renderedSourceLength: number = undefined;
	private sortedExportNames: string[] | null = null;

	constructor(graph: Graph, orderedModules: Module[]) {
		this.graph = graph;
		this.orderedModules = orderedModules;
		this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;

		this.isEmpty = true;
		for (const module of orderedModules) {
			if (this.isEmpty && module.isIncluded()) {
				this.isEmpty = false;
			}
			if (module.manualChunkAlias) {
				this.manualChunkAlias = module.manualChunkAlias;
			}
			module.chunk = this;
			if (
				module.isEntryPoint ||
				module.dynamicallyImportedBy.some(module => orderedModules.indexOf(module) === -1)
			) {
				this.entryModules.push(module);
			}
		}

		const entryModule = this.entryModules[0];
		if (entryModule) {
			this.variableName = makeLegal(
				basename(
					entryModule.chunkAlias || entryModule.manualChunkAlias || getAliasName(entryModule.id)
				)
			);
		} else {
			this.variableName = '__chunk_' + ++graph.curChunkIndex;
		}
	}

	generateEntryExportsOrMarkAsTainted() {
		const exportVariableMaps = this.entryModules.map(module => ({
			map: this.getVariableExportNamesForModule(module),
			module
		}));
		for (const { map } of exportVariableMaps) {
			for (const exposedVariable of map.keys()) {
				this.exports.add(exposedVariable);
			}
		}
		checkNextEntryModule: for (const { map, module } of exportVariableMaps) {
			if (!this.graph.preserveModules) {
				if (
					this.manualChunkAlias &&
					module.chunkAlias &&
					this.manualChunkAlias !== module.chunkAlias
				) {
					continue checkNextEntryModule;
				}
				for (const exposedVariable of this.exports) {
					if (!map.has(exposedVariable)) {
						continue checkNextEntryModule;
					}
				}
			}
			this.facadeModule = module;
			for (const [variable, exportNames] of map) {
				for (const exportName of exportNames) {
					this.exportNames[exportName] = variable;
				}
			}
			return;
		}
	}

	generateId(
		pattern: string,
		patternName: string,
		addons: Addons,
		options: OutputOptions,
		existingNames: Record<string, true>
	) {
		this.id = makeUnique(
			renderNamePattern(pattern, patternName, type => {
				switch (type) {
					case 'format':
						return options.format === 'es' ? 'esm' : options.format;
					case 'hash':
						return this.computeContentHashWithDependencies(addons, options);
					case 'name':
						return this.getChunkName();
				}
			}),
			existingNames
		);
	}

	generateIdPreserveModules(
		preserveModulesRelativeDir: string,
		existingNames: Record<string, true>
	) {
		const sanitizedId = sanitizeFileName(this.orderedModules[0].id);
		this.id = makeUnique(
			normalize(
				isAbsolute(this.orderedModules[0].id)
					? relative(preserveModulesRelativeDir, sanitizedId)
					: '_virtual/' + basename(sanitizedId)
			),
			existingNames
		);
	}

	generateInternalExports(options: OutputOptions) {
		if (this.facadeModule !== null) return;
		const mangle = options.format === 'system' || options.format === 'es' || options.compact;
		let i = 0,
			safeExportName: string;
		this.exportNames = Object.create(null);
		this.sortedExportNames = null;
		if (mangle) {
			for (const variable of this.exports) {
				do {
					safeExportName = toBase64(++i);
					// skip past leading number identifiers
					if (safeExportName.charCodeAt(0) === 49 /* '1' */) {
						i += 9 * 64 ** (safeExportName.length - 1);
						safeExportName = toBase64(i);
					}
				} while (RESERVED_NAMES[safeExportName]);
				this.exportNames[safeExportName] = variable;
			}
		} else {
			for (const variable of this.exports) {
				i = 0;
				safeExportName = variable.name;
				while (this.exportNames[safeExportName]) {
					safeExportName = variable.name + '$' + ++i;
				}
				this.exportNames[safeExportName] = variable;
			}
		}
	}

	getChunkName(): string {
		return this.chunkName || (this.chunkName = this.computeChunkName());
	}

	getDynamicImportIds(): string[] {
		return this.dynamicDependencies.map(chunk => chunk.id).filter(Boolean);
	}

	getExportNames(): string[] {
		return (
			this.sortedExportNames || (this.sortedExportNames = Object.keys(this.exportNames).sort())
		);
	}

	getImportIds(): string[] {
		return this.dependencies.map(chunk => chunk.id);
	}

	getRenderedHash(): string {
		if (this.renderedHash) return this.renderedHash;
		if (!this.renderedSource) return '';
		const hash = sha256();
		hash.update(this.renderedSource.toString());
		hash.update(
			this.getExportNames()
				.map(exportName => {
					const variable = this.exportNames[exportName];
					return `${relativeId(variable.module.id).replace(/\\/g, '/')}:${
						variable.name
					}:${exportName}`;
				})
				.join(',')
		);
		return (this.renderedHash = hash.digest('hex'));
	}

	getRenderedSourceLength() {
		if (this.renderedSourceLength !== undefined) return this.renderedSourceLength;
		return (this.renderedSourceLength = this.renderedSource.length());
	}

	getVariableExportName(variable: Variable) {
		if (this.graph.preserveModules && variable instanceof NamespaceVariable) {
			return '*';
		}
		for (const exportName of Object.keys(this.exportNames)) {
			if (this.exportNames[exportName] === variable) return exportName;
		}
	}

	link() {
		const dependencies: Set<Chunk | ExternalModule> = new Set();
		const dynamicDependencies: Set<Chunk | ExternalModule> = new Set();
		for (const module of this.orderedModules) {
			this.addChunksFromDependencies(module.dependencies, dependencies);
			this.addChunksFromDependencies(module.getReexportModules(), dependencies);
			this.addChunksFromDependencies(module.dynamicDependencies, dynamicDependencies);
			this.setUpModuleImports(module);
		}
		this.dependencies = Array.from(dependencies);
		this.dynamicDependencies = Array.from(dynamicDependencies);
	}

	/*
	 * Performs a full merge of another chunk into this chunk
	 * chunkList allows updating references in other chunks for the merged chunk to this chunk
	 * A new facade will be added to chunkList if tainting exports of either as an entry point
	 */
	merge(chunk: Chunk, chunkList: Chunk[], options: OutputOptions, inputBase: string) {
		if (this.facadeModule !== null || chunk.facadeModule !== null)
			throw new Error('Internal error: Code splitting chunk merges not supported for facades');

		for (const module of chunk.orderedModules) {
			module.chunk = this;
			this.orderedModules.push(module);
		}

		for (const variable of chunk.imports) {
			if (!this.imports.has(variable) && variable.module.chunk !== this) {
				this.imports.add(variable);
			}
		}

		// NB detect when exported variables are orphaned by the merge itself
		// (involves reverse tracing dependents)
		for (const variable of chunk.exports) {
			if (!this.exports.has(variable)) {
				this.exports.add(variable);
			}
		}

		const thisOldExportNames = this.exportNames;

		// regenerate internal names
		this.generateInternalExports(options);

		const updateRenderedDeclaration = (
			dep: ModuleDeclarationDependency,
			oldExportNames: Record<string, Variable>
		) => {
			if (dep.imports) {
				for (const impt of dep.imports) {
					impt.imported = this.getVariableExportName(oldExportNames[impt.imported]);
				}
			}
			if (dep.reexports) {
				for (const reexport of dep.reexports) {
					reexport.imported = this.getVariableExportName(oldExportNames[reexport.imported]);
				}
			}
		};

		const mergeRenderedDeclaration = (
			into: ModuleDeclarationDependency,
			from: ModuleDeclarationDependency
		) => {
			if (from.imports) {
				if (!into.imports) {
					into.imports = from.imports;
				} else {
					into.imports = into.imports.concat(from.imports);
				}
			}
			if (from.reexports) {
				if (!into.reexports) {
					into.reexports = from.reexports;
				} else {
					into.reexports = into.reexports.concat(from.reexports);
				}
			}
			if (!into.exportsNames && from.exportsNames) {
				into.exportsNames = true;
			}
			if (!into.exportsDefault && from.exportsDefault) {
				into.exportsDefault = true;
			}
			into.name = this.variableName;
		};

		// go through the other chunks and update their dependencies
		// also update their import and reexport names in the process
		for (const c of chunkList) {
			let includedDeclaration: ModuleDeclarationDependency;
			for (let i = 0; i < c.dependencies.length; i++) {
				const dep = c.dependencies[i];
				if ((dep === chunk || dep === this) && includedDeclaration) {
					const duplicateDeclaration = c.renderedDeclarations.dependencies[i];
					updateRenderedDeclaration(
						duplicateDeclaration,
						dep === chunk ? chunk.exportNames : thisOldExportNames
					);
					mergeRenderedDeclaration(includedDeclaration, duplicateDeclaration);
					c.renderedDeclarations.dependencies.splice(i, 1);
					c.dependencies.splice(i--, 1);
				} else if (dep === chunk) {
					c.dependencies[i] = this;
					includedDeclaration = c.renderedDeclarations.dependencies[i];
					updateRenderedDeclaration(includedDeclaration, chunk.exportNames);
				} else if (dep === this) {
					includedDeclaration = c.renderedDeclarations.dependencies[i];
					updateRenderedDeclaration(includedDeclaration, thisOldExportNames);
				}
			}
		}

		// re-render the merged chunk
		this.preRender(options, inputBase);
	}

	// prerender allows chunk hashes and names to be generated before finalizing
	preRender(options: OutputOptions, inputBase: string) {
		timeStart('render modules', 3);

		const magicString = new MagicStringBundle({ separator: options.compact ? '' : '\n\n' });
		this.usedModules = [];
		this.indentString = options.compact ? '' : getIndentString(this.orderedModules, options);

		const n = options.compact ? '' : '\n';
		const _ = options.compact ? '' : ' ';

		const renderOptions: RenderOptions = {
			compact: options.compact,
			dynamicImportFunction: options.dynamicImportFunction,
			format: options.format,
			freeze: options.freeze !== false,
			indent: this.indentString,
			namespaceToStringTag: options.namespaceToStringTag === true,
			varOrConst: options.preferConst ? 'const' : 'var'
		};

		// Make sure the direct dependencies of a chunk are present to maintain execution order
		for (const { module } of this.imports) {
			const chunkOrExternal = module instanceof Module ? module.chunk : module;
			if (this.dependencies.indexOf(chunkOrExternal) === -1) {
				this.dependencies.push(chunkOrExternal);
			}
		}
		// for static and dynamic entry points, inline the execution list to avoid loading latency
		if (!this.graph.preserveModules && this.facadeModule !== null) {
			for (const dep of this.dependencies) {
				if (dep instanceof Chunk) this.inlineChunkDependencies(dep, true);
			}
		}
		// prune empty dependency chunks, inlining their side-effect dependencies
		for (let i = 0; i < this.dependencies.length; i++) {
			const dep = this.dependencies[i];
			if (dep instanceof Chunk && dep.isEmpty) {
				this.dependencies.splice(i--, 1);
				this.inlineChunkDependencies(dep, false);
			}
		}
		sortByExecutionOrder(this.dependencies);

		this.setIdentifierRenderResolutions(options);
		this.prepareDynamicImports();

		let hoistedSource = '';

		this.renderedModules = Object.create(null);
		this.renderedModuleSources = [];

		for (let i = 0; i < this.orderedModules.length; i++) {
			const module = this.orderedModules[i];
			const source = module.render(renderOptions);
			source.trim();
			if (options.compact && source.lastLine().indexOf('//') !== -1) source.append('\n');
			this.renderedModuleSources.push(source);

			const { renderedExports, removedExports } = module.getRenderedExports();
			this.renderedModules[module.id] = {
				originalLength: module.originalCode.length,
				removedExports,
				renderedExports,
				renderedLength: source.length()
			};

			const namespace = module.getOrCreateNamespace();
			if (namespace.included || !source.isEmpty()) {
				magicString.addSource(source);
				this.usedModules.push(module);

				if (namespace.included && !this.graph.preserveModules) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += n + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
			}
		}

		if (hoistedSource) magicString.prepend(hoistedSource + n + n);

		if (this.needsExportsShim) {
			magicString.prepend(
				`${n}${renderOptions.varOrConst} ${MISSING_EXPORT_SHIM_VARIABLE}${_}=${_}void 0;${n}${n}`
			);
		}

		if (options.compact) {
			this.renderedSource = magicString;
		} else {
			this.renderedSource = magicString.trim();
		}

		this.renderedSourceLength = undefined;
		this.renderedHash = undefined;

		if (this.getExportNames().length === 0 && this.getImportIds().length === 0 && this.isEmpty) {
			this.graph.warn({
				code: 'EMPTY_BUNDLE',
				message: 'Generated an empty bundle'
			});
		}

		this.setExternalRenderPaths(options, inputBase);

		this.renderedDeclarations = {
			dependencies: this.getChunkDependencyDeclarations(options),
			exports: this.exportMode === 'none' ? [] : this.getChunkExportDeclarations()
		};

		timeEnd('render modules', 3);
	}

	render(options: OutputOptions, addons: Addons, outputChunk: RenderedChunk) {
		timeStart('render format', 3);

		if (!this.renderedSource)
			throw new Error('Internal error: Chunk render called before preRender');

		const finalise = finalisers[options.format];
		if (!finalise) {
			error({
				code: 'INVALID_OPTION',
				message: `Invalid format: ${options.format} - valid options are ${Object.keys(
					finalisers
				).join(', ')}.`
			});
		}
		if (options.dynamicImportFunction && options.format !== 'es') {
			this.graph.warn({
				code: 'INVALID_OPTION',
				message: '"output.dynamicImportFunction" is ignored for formats other than "esm".'
			});
		}

		// populate ids in the rendered declarations only here
		// as chunk ids known only after prerender
		for (let i = 0; i < this.dependencies.length; i++) {
			const dep = this.dependencies[i];
			if (dep instanceof ExternalModule && !dep.renormalizeRenderPath) continue;

			const renderedDependency = this.renderedDeclarations.dependencies[i];

			const depId = dep instanceof ExternalModule ? renderedDependency.id : dep.id;
			let relPath = this.id ? normalize(relative(dirname(this.id), depId)) : depId;
			if (!relPath.startsWith('../')) relPath = './' + relPath;

			if (dep instanceof Chunk) renderedDependency.namedExportsMode = dep.exportMode !== 'default';
			renderedDependency.id = relPath;
		}

		this.finaliseDynamicImports(options.format);
		const needsAmdModule = this.finaliseImportMetas(options);

		const hasExports =
			this.renderedDeclarations.exports.length !== 0 ||
			this.renderedDeclarations.dependencies.some(
				dep => dep.reexports && dep.reexports.length !== 0
			);

		const usesTopLevelAwait = this.orderedModules.some(module => module.usesTopLevelAwait);
		if (usesTopLevelAwait && options.format !== 'es' && options.format !== 'system') {
			error({
				code: 'INVALID_TLA_FORMAT',
				message: `Module format ${
					options.format
				} does not support top-level await. Use the "es" or "system" output formats rather.`
			});
		}

		const magicString = finalise(
			this.renderedSource,
			{
				dependencies: this.renderedDeclarations.dependencies,
				dynamicImport: this.hasDynamicImport,
				exports: this.renderedDeclarations.exports,
				hasExports,
				indentString: this.indentString,
				intro: addons.intro,
				isEntryModuleFacade: this.facadeModule !== null && this.facadeModule.isEntryPoint,
				namedExportsMode: this.exportMode !== 'default',
				needsAmdModule,
				outro: addons.outro,
				usesTopLevelAwait,
				varOrConst: options.preferConst ? 'const' : 'var',
				warn: this.graph.warn.bind(this.graph)
			},
			options
		);
		if (addons.banner) magicString.prepend(addons.banner);
		if (addons.footer) magicString.append(addons.footer);
		const prevCode = magicString.toString();

		timeEnd('render format', 3);

		let map: SourceMap = null;
		const chunkSourcemapChain: RawSourceMap[] = [];

		return renderChunk({
			chunk: this,
			code: prevCode,
			graph: this.graph,
			options,
			renderChunk: outputChunk,
			sourcemapChain: chunkSourcemapChain
		}).then((code: string) => {
			if (options.sourcemap) {
				timeStart('sourcemap', 3);

				let file: string;
				if (options.file) file = resolve(options.sourcemapFile || options.file);
				else if (options.dir) file = resolve(options.dir, this.id);
				else file = resolve(this.id);

				if (this.graph.pluginDriver.hasLoadersOrTransforms) {
					const decodedMap = magicString.generateDecodedMap({});
					map = collapseSourcemaps(
						this,
						file,
						decodedMap,
						this.usedModules,
						chunkSourcemapChain,
						options.sourcemapExcludeSources
					);
				} else {
					map = magicString.generateMap({ file, includeContent: !options.sourcemapExcludeSources });
				}

				map.sources = map.sources.map(sourcePath =>
					normalize(
						options.sourcemapPathTransform ? options.sourcemapPathTransform(sourcePath) : sourcePath
					)
				);

				timeEnd('sourcemap', 3);
			}

			if (options.compact !== true && code[code.length - 1] !== '\n') code += '\n';

			return { code, map };
		});
	}

	turnIntoFacade(facadedModule: Module) {
		this.dependencies = [facadedModule.chunk];
		this.dynamicDependencies = [];
		this.facadeModule = facadedModule;
		facadedModule.facadeChunk = this;
		for (const exportName of facadedModule.getAllExports()) {
			const tracedVariable = facadedModule.getVariableForExportName(exportName);
			this.exports.add(tracedVariable);
			this.exportNames[exportName] = tracedVariable;
		}
	}

	visitDependencies(handleDependency: (dependency: Chunk | ExternalModule) => void) {
		const toBeVisited: (Chunk | ExternalModule)[] = [this];
		const visited: Set<Chunk | ExternalModule> = new Set();
		for (const current of toBeVisited) {
			handleDependency(current);
			if (current instanceof ExternalModule) continue;
			for (const dependency of current.dependencies.concat(current.dynamicDependencies)) {
				if (!visited.has(dependency)) {
					visited.add(dependency);
					toBeVisited.push(dependency);
				}
			}
		}
	}

	visitStaticDependenciesUntilCondition(
		isConditionSatisfied: (dep: Chunk | ExternalModule) => any
	): boolean {
		const seen = new Set<Chunk | ExternalModule>();
		function visitDep(dep: Chunk | ExternalModule): boolean {
			if (seen.has(dep)) return;
			seen.add(dep);
			if (dep instanceof Chunk) {
				for (const subDep of dep.dependencies) {
					if (visitDep(subDep)) return true;
				}
			}
			return isConditionSatisfied(dep) === true;
		}
		return visitDep(this);
	}

	private addChunksFromDependencies(
		moduleDependencies: (Module | ExternalModule)[],
		chunkDependencies: Set<Chunk | ExternalModule>
	) {
		for (const depModule of moduleDependencies) {
			if (depModule.chunk === this) {
				continue;
			}
			let dependency: Chunk | ExternalModule;
			if (depModule instanceof Module) {
				dependency = depModule.chunk;
			} else {
				if (!(depModule.used || depModule.moduleSideEffects)) {
					continue;
				}
				dependency = depModule;
			}
			chunkDependencies.add(dependency);
		}
	}

	private computeChunkName(): string {
		if (this.manualChunkAlias) {
			return sanitizeFileName(this.manualChunkAlias);
		}
		if (this.facadeModule !== null) {
			return sanitizeFileName(this.facadeModule.chunkAlias || getAliasName(this.facadeModule.id));
		}
		for (const module of this.orderedModules) {
			if (module.chunkAlias) return sanitizeFileName(module.chunkAlias);
		}
		return 'chunk';
	}

	private computeContentHashWithDependencies(addons: Addons, options: OutputOptions): string {
		const hash = sha256();

		hash.update(
			[addons.intro, addons.outro, addons.banner, addons.footer].map(addon => addon || '').join(':')
		);
		hash.update(options.format);
		this.visitDependencies(dep => {
			if (dep instanceof ExternalModule) hash.update(':' + dep.renderPath);
			else hash.update(dep.getRenderedHash());
		});

		return hash.digest('hex').substr(0, 8);
	}

	private finaliseDynamicImports(format: string) {
		for (let i = 0; i < this.orderedModules.length; i++) {
			const module = this.orderedModules[i];
			const code = this.renderedModuleSources[i];
			for (const { node, resolution } of module.dynamicImports) {
				if (!resolution) continue;
				if (resolution instanceof Module) {
					if (resolution.chunk !== this && isChunkRendered(resolution.chunk)) {
						const resolutionChunk = resolution.facadeChunk || resolution.chunk;
						let relPath = normalize(relative(dirname(this.id), resolutionChunk.id));
						if (!relPath.startsWith('../')) relPath = './' + relPath;
						node.renderFinalResolution(code, `'${relPath}'`, format);
					}
				} else if (resolution instanceof ExternalModule) {
					let resolutionId = resolution.id;
					if (resolution.renormalizeRenderPath) {
						resolutionId = normalize(relative(dirname(this.id), resolution.renderPath));
						if (!resolutionId.startsWith('../')) resolutionId = './' + resolutionId;
					}
					node.renderFinalResolution(code, `'${resolutionId}'`, format);
				} else {
					node.renderFinalResolution(code, resolution, format);
				}
			}
		}
	}

	private finaliseImportMetas(options: OutputOptions): boolean {
		let needsAmdModule = false;
		for (let i = 0; i < this.orderedModules.length; i++) {
			const module = this.orderedModules[i];
			const code = this.renderedModuleSources[i];
			for (const importMeta of module.importMetas) {
				if (
					importMeta.renderFinalMechanism(code, this.id, options.format, this.graph.pluginDriver)
				) {
					needsAmdModule = true;
				}
			}
		}
		return needsAmdModule;
	}

	private getChunkDependencyDeclarations(options: OutputOptions): ChunkDependencies {
		const reexportDeclarations = new Map<Chunk | ExternalModule, ReexportSpecifier[]>();

		for (let exportName of this.getExportNames()) {
			let exportModule: Chunk | ExternalModule;
			let importName: string;
			let needsLiveBinding = false;
			if (exportName[0] === '*') {
				exportModule = <ExternalModule>this.graph.moduleById.get(exportName.substr(1));
				importName = exportName = '*';
			} else {
				const variable = this.exportNames[exportName];
				const module = variable.module;
				// skip local exports
				if (!module || module.chunk === this) continue;
				if (module instanceof Module) {
					exportModule = module.chunk;
					importName = module.chunk.getVariableExportName(variable);
					needsLiveBinding = variable.isReassigned;
				} else {
					exportModule = module;
					importName = variable.name;
					needsLiveBinding = true;
				}
			}
			let exportDeclaration = reexportDeclarations.get(exportModule);
			if (!exportDeclaration) reexportDeclarations.set(exportModule, (exportDeclaration = []));
			exportDeclaration.push({ imported: importName, reexported: exportName, needsLiveBinding });
		}

		const renderedImports = new Set<Variable>();
		const dependencies: ChunkDependencies = [];

		for (const dep of this.dependencies) {
			const imports: ImportSpecifier[] = [];
			for (const variable of this.imports) {
				const renderedVariable =
					variable instanceof ExportDefaultVariable && variable.referencesOriginal()
						? variable.getOriginalVariable()
						: variable;
				if (
					(variable.module instanceof Module
						? variable.module.chunk === dep
						: variable.module === dep) &&
					!renderedImports.has(renderedVariable)
				) {
					renderedImports.add(renderedVariable);
					const local = variable.getName();
					const imported =
						variable.module instanceof ExternalModule
							? variable.name
							: variable.module.chunk.getVariableExportName(variable);
					imports.push({ local, imported });
				}
			}

			const reexports = reexportDeclarations.get(dep);
			let exportsNames: boolean, exportsDefault: boolean;
			let namedExportsMode = true;
			if (dep instanceof ExternalModule) {
				exportsNames = dep.exportsNames || dep.exportsNamespace;
				exportsDefault = 'default' in dep.declarations;
			} else {
				exportsNames = true;
				// we don't want any interop patterns to trigger
				exportsDefault = false;
				namedExportsMode = dep.exportMode !== 'default';
			}

			let id: string;
			let globalName: string;
			if (dep instanceof ExternalModule) {
				id = dep.renderPath;
				if (options.format === 'umd' || options.format === 'iife') {
					globalName = getGlobalName(
						dep,
						options.globals,
						this.graph,
						exportsNames || exportsDefault
					);
				}
			}

			dependencies.push({
				exportsDefault,
				exportsNames,
				globalName,
				id, // chunk id updated on render
				imports: imports.length > 0 ? imports : null,
				isChunk: !(<ExternalModule>dep).isExternal,
				name: dep.variableName,
				namedExportsMode,
				reexports
			});
		}

		return dependencies;
	}

	private getChunkExportDeclarations(): ChunkExports {
		const exports: ChunkExports = [];
		for (const exportName of this.getExportNames()) {
			if (exportName[0] === '*') continue;

			const variable = this.exportNames[exportName];
			const module = variable.module;

			if (module && module.chunk !== this) continue;
			let hoisted = false;
			let uninitialized = false;
			if (variable instanceof LocalVariable) {
				if (variable.init === UNDEFINED_EXPRESSION) {
					uninitialized = true;
				}
				variable.declarations.forEach(decl => {
					if (decl.type === NodeType.ExportDefaultDeclaration) {
						if (decl.declaration.type === NodeType.FunctionDeclaration) hoisted = true;
					} else if (decl.parent.type === NodeType.FunctionDeclaration) {
						hoisted = true;
					}
				});
			} else if (variable instanceof GlobalVariable) {
				hoisted = true;
			}

			const localName = variable.getName();

			exports.push({
				exported: exportName === '*' ? localName : exportName,
				hoisted,
				local: localName,
				uninitialized
			});
		}
		return exports;
	}

	private getVariableExportNamesForModule(module: Module) {
		const exportNamesByVariable: Map<Variable, string[]> = new Map();
		for (const exportName of module.getAllExports()) {
			const tracedVariable = module.getVariableForExportName(exportName);
			if (!tracedVariable || !(tracedVariable.included || tracedVariable.isExternal)) {
				continue;
			}
			const existingExportNames = exportNamesByVariable.get(tracedVariable);
			if (existingExportNames) {
				existingExportNames.push(exportName);
			} else {
				exportNamesByVariable.set(tracedVariable, [exportName]);
			}
			const exportingModule = tracedVariable.module;
			if (exportingModule && exportingModule.chunk && exportingModule.chunk !== this) {
				exportingModule.chunk.exports.add(tracedVariable);
			}
		}
		return exportNamesByVariable;
	}

	private inlineChunkDependencies(chunk: Chunk, deep: boolean) {
		for (const dep of chunk.dependencies) {
			if (dep instanceof ExternalModule) {
				if (this.dependencies.indexOf(dep) === -1) this.dependencies.push(dep);
			} else {
				if (dep === this || this.dependencies.indexOf(dep) !== -1) continue;
				if (!dep.isEmpty) this.dependencies.push(dep);
				if (deep) this.inlineChunkDependencies(dep, true);
			}
		}
	}

	private prepareDynamicImports() {
		for (const module of this.orderedModules) {
			for (const { node, resolution } of module.dynamicImports) {
				if (!resolution) continue;
				if (resolution instanceof Module) {
					if (resolution.chunk === this) {
						const namespace = resolution.getOrCreateNamespace();
						node.setResolution(false, namespace.getName());
					} else {
						node.setResolution(false);
					}
				} else if (resolution instanceof ExternalModule) {
					node.setResolution(false);
				} else {
					node.setResolution(false);
				}
			}
		}
	}

	private setExternalRenderPaths(options: OutputOptions, inputBase: string) {
		for (const dependency of this.dependencies.concat(this.dynamicDependencies)) {
			if (dependency instanceof ExternalModule) {
				dependency.setRenderPath(options, inputBase);
			}
		}
	}

	private setIdentifierRenderResolutions(options: OutputOptions) {
		for (const exportName of this.getExportNames()) {
			const exportVariable = this.exportNames[exportName];
			if (exportVariable) {
				if (exportVariable instanceof ExportShimVariable) {
					this.needsExportsShim = true;
				}
				exportVariable.exportName = exportName;
				if (
					options.format !== 'es' &&
					options.format !== 'system' &&
					exportVariable.isReassigned &&
					!exportVariable.isId &&
					(!isExportDefaultVariable(exportVariable) || !exportVariable.hasId)
				) {
					exportVariable.setRenderNames('exports', exportName);
				} else {
					exportVariable.setRenderNames(null, null);
				}
			}
		}

		const usedNames = Object.create(null);
		if (this.needsExportsShim) {
			usedNames[MISSING_EXPORT_SHIM_VARIABLE] = true;
		}

		deconflictChunk(
			this.orderedModules,
			this.dependencies,
			this.imports,
			usedNames,
			options.format,
			options.interop !== false,
			this.graph.preserveModules
		);
	}

	private setUpModuleImports(module: Module) {
		for (const variable of module.imports) {
			if (variable.module.chunk !== this) {
				this.imports.add(variable);
				if (variable.module instanceof Module) {
					variable.module.chunk.exports.add(variable);
				}
			}
		}
		if (module.getOrCreateNamespace().included) {
			for (const reexportName of Object.keys(module.reexports)) {
				const reexport = module.reexports[reexportName];
				const variable = reexport.module.getVariableForExportName(reexport.localName);
				if (variable.module.chunk !== this) {
					this.imports.add(variable);
					if (variable.module instanceof Module) {
						variable.module.chunk.exports.add(variable);
					}
				}
			}
		}
		for (const { node, resolution } of module.dynamicImports) {
			if (node.included) {
				this.hasDynamicImport = true;
				if (resolution instanceof Module && resolution.chunk === this)
					resolution.getOrCreateNamespace().include();
			}
		}
	}
}
