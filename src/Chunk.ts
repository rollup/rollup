import sha256 from 'hash.js/lib/hash/sha/256';
import MagicString, { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import { relative } from '../browser/path';
import ExportDefaultDeclaration from './ast/nodes/ExportDefaultDeclaration';
import FunctionDeclaration from './ast/nodes/FunctionDeclaration';
import { UNDEFINED_EXPRESSION } from './ast/values';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
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
import { basename, dirname, isAbsolute, normalize, resolve } from './utils/path';
import relativeId, { getAliasName } from './utils/relativeId';
import renderChunk from './utils/renderChunk';
import { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { RESERVED_NAMES } from './utils/reservedNames';
import { sanitizeFileName } from './utils/sanitizeFileName';
import { timeEnd, timeStart } from './utils/timers';
import { INTEROP_DEFAULT_VARIABLE, MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

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
			message: `No name was provided for external module '${module.id}' in output.globals – guessing '${module.variableName}'`,
			source: module.id
		});
		return module.variableName;
	}
}

export function isChunkRendered(chunk: Chunk): boolean {
	return !chunk.isEmpty || chunk.entryModules.length > 0 || chunk.manualChunkAlias !== null;
}

export default class Chunk {
	static generateFacade(graph: Graph, facadedModule: Module): Chunk {
		const chunk = new Chunk(graph, []);
		chunk.dependencies = [facadedModule.chunk as Chunk];
		chunk.dynamicDependencies = [];
		chunk.facadeModule = facadedModule;
		facadedModule.facadeChunk = chunk;
		for (const exportName of facadedModule.getAllExportNames()) {
			const tracedVariable = facadedModule.getVariableForExportName(exportName);
			chunk.exports.add(tracedVariable);
			chunk.exportNames[exportName] = tracedVariable;
		}
		return chunk;
	}

	entryModules: Module[] = [];
	execIndex: number;
	exportMode: 'none' | 'named' | 'default' = 'named';
	facadeModule: Module | null = null;
	graph: Graph;
	id: string = undefined as any;
	indentString: string = undefined as any;
	isEmpty: boolean;
	manualChunkAlias: string | null = null;
	orderedModules: Module[];
	renderedModules?: {
		[moduleId: string]: RenderedModule;
	};
	usedModules: Module[] = undefined as any;

	variableName: string;
	private chunkName?: string;
	private dependencies: (ExternalModule | Chunk)[] = undefined as any;
	private dynamicDependencies: (ExternalModule | Chunk)[] = undefined as any;
	private exportNames: { [name: string]: Variable } = Object.create(null);
	private exports = new Set<Variable>();
	private imports = new Set<Variable>();
	private needsExportsShim = false;
	private renderedDeclarations: {
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	} = undefined as any;
	private renderedHash: string = undefined as any;
	private renderedModuleSources = new Map<Module, MagicString>();
	private renderedSource: MagicStringBundle | null = null;
	private renderedSourceLength: number = undefined as any;
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

	canModuleBeFacade(
		moduleExportNamesByVariable: Map<Variable, string[]>,
		moduleChunkAlias: string | null
	): boolean {
		if (this.manualChunkAlias && moduleChunkAlias && this.manualChunkAlias !== moduleChunkAlias) {
			return false;
		}
		for (const exposedVariable of this.exports) {
			if (!moduleExportNamesByVariable.has(exposedVariable)) {
				return false;
			}
		}
		return true;
	}

	generateFacades(): Chunk[] {
		const facades: Chunk[] = [];
		for (const module of this.entryModules) {
			if (!this.facadeModule) {
				const exportNamesByVariable = module.getExportNamesByVariable();
				if (
					this.graph.preserveModules ||
					this.canModuleBeFacade(exportNamesByVariable, module.chunkAlias)
				) {
					this.facadeModule = module;
					for (const [variable, exportNames] of exportNamesByVariable) {
						for (const exportName of exportNames) {
							this.exportNames[exportName] = variable;
						}
					}
					continue;
				}
			}
			facades.push(Chunk.generateFacade(this.graph, module));
		}
		return facades;
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
				return undefined as any;
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
				const suggestedName = variable.name[0];
				if (!this.exportNames[suggestedName]) {
					this.exportNames[suggestedName] = variable;
				} else {
					do {
						safeExportName = toBase64(++i);
						// skip past leading number identifiers
						if (safeExportName.charCodeAt(0) === 49 /* '1' */) {
							i += 9 * 64 ** (safeExportName.length - 1);
							safeExportName = toBase64(i);
						}
					} while (RESERVED_NAMES[safeExportName] || this.exportNames[safeExportName]);
					this.exportNames[safeExportName] = variable;
				}
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
					return `${relativeId((variable.module as Module).id).replace(/\\/g, '/')}:${
						variable.name
					}:${exportName}`;
				})
				.join(',')
		);
		return (this.renderedHash = hash.digest('hex'));
	}

	getRenderedSourceLength() {
		if (this.renderedSourceLength !== undefined) return this.renderedSourceLength;
		return (this.renderedSourceLength = (this.renderedSource as MagicStringBundle).length());
	}

	getVariableExportName(variable: Variable): string {
		if (this.graph.preserveModules && variable instanceof NamespaceVariable) {
			return '*';
		}
		for (const exportName of Object.keys(this.exportNames)) {
			if (this.exportNames[exportName] === variable) return exportName;
		}
		throw new Error(`Internal Error: Could not find export name for variable ${variable.name}.`);
	}

	link() {
		const dependencies: Set<Chunk | ExternalModule> = new Set();
		const dynamicDependencies: Set<Chunk | ExternalModule> = new Set();
		for (const module of this.orderedModules) {
			this.addDependenciesToChunk(module.getTransitiveDependencies(), dependencies);
			this.addDependenciesToChunk(module.dynamicDependencies, dynamicDependencies);
			this.setUpChunkImportsAndExportsForModule(module);
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
			if (!this.imports.has(variable) && (variable.module as Module).chunk !== this) {
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
			let includedDeclaration: ModuleDeclarationDependency = undefined as any;
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
			compact: options.compact as boolean,
			dynamicImportFunction: options.dynamicImportFunction as string,
			format: options.format as string,
			freeze: options.freeze !== false,
			indent: this.indentString,
			namespaceToStringTag: options.namespaceToStringTag === true,
			varOrConst: options.preferConst ? 'const' : 'var'
		};

		// Make sure the direct dependencies of a chunk are present to maintain execution order
		for (const { module } of this.imports) {
			const chunkOrExternal = (module instanceof Module ? module.chunk : module) as
				| Chunk
				| ExternalModule;
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
		const renderedModules = (this.renderedModules = Object.create(null));

		for (const module of this.orderedModules) {
			let renderedLength = 0;
			if (module.isIncluded()) {
				const source = module.render(renderOptions).trim();
				if (options.compact && source.lastLine().indexOf('//') !== -1) source.append('\n');
				const namespace = module.getOrCreateNamespace();
				if (namespace.included || source.length() > 0) {
					renderedLength = source.length();
					this.renderedModuleSources.set(module, source);
					magicString.addSource(source);
					this.usedModules.push(module);

					if (namespace.included && !this.graph.preserveModules) {
						const rendered = namespace.renderBlock(renderOptions);
						if (namespace.renderFirst()) hoistedSource += n + rendered;
						else magicString.addSource(new MagicString(rendered));
					}
				}
			}
			const { renderedExports, removedExports } = module.getRenderedExports();
			renderedModules[module.id] = {
				originalLength: module.originalCode.length,
				removedExports,
				renderedExports,
				renderedLength
			};
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

		this.renderedSourceLength = undefined as any;
		this.renderedHash = undefined as any;

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

		const format = options.format as string;
		const finalise = finalisers[format];
		if (!finalise) {
			error({
				code: 'INVALID_OPTION',
				message: `Invalid format: ${format} - valid options are ${Object.keys(finalisers).join(
					', '
				)}.`
			});
		}
		if (options.dynamicImportFunction && format !== 'es') {
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

		this.finaliseDynamicImports(format);
		this.finaliseImportMetas(format);

		const hasExports =
			this.renderedDeclarations.exports.length !== 0 ||
			this.renderedDeclarations.dependencies.some(
				dep => (dep.reexports && dep.reexports.length !== 0) as boolean
			);

		let usesTopLevelAwait = false;
		const accessedGlobals = new Set<string>();
		for (const module of this.orderedModules) {
			if (module.usesTopLevelAwait) {
				usesTopLevelAwait = true;
			}
			const accessedGlobalVariablesByFormat = module.scope.accessedGlobalVariablesByFormat;
			const accessedGlobalVariables =
				accessedGlobalVariablesByFormat && accessedGlobalVariablesByFormat.get(format);
			if (accessedGlobalVariables) {
				for (const name of accessedGlobalVariables) {
					accessedGlobals.add(name);
				}
			}
		}

		if (usesTopLevelAwait && format !== 'es' && format !== 'system') {
			error({
				code: 'INVALID_TLA_FORMAT',
				message: `Module format ${format} does not support top-level await. Use the "es" or "system" output formats rather.`
			});
		}

		const magicString = finalise(
			this.renderedSource,
			{
				accessedGlobals,
				dependencies: this.renderedDeclarations.dependencies,
				exports: this.renderedDeclarations.exports,
				hasExports,
				indentString: this.indentString,
				intro: addons.intro as string,
				isEntryModuleFacade: this.facadeModule !== null && this.facadeModule.isEntryPoint,
				namedExportsMode: this.exportMode !== 'default',
				outro: addons.outro as string,
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

		let map: SourceMap = null as any;
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
						options.sourcemapExcludeSources as boolean
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
			if (seen.has(dep)) return undefined as any;
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

	private addDependenciesToChunk(
		moduleDependencies: (Module | ExternalModule)[],
		chunkDependencies: Set<Chunk | ExternalModule>
	) {
		for (const depModule of moduleDependencies) {
			if (depModule.chunk === this) {
				continue;
			}
			let dependency: Chunk | ExternalModule;
			if (depModule instanceof Module) {
				dependency = depModule.chunk as Chunk;
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
		for (const [module, code] of this.renderedModuleSources) {
			for (const { node, resolution } of module.dynamicImports) {
				if (!resolution) continue;
				if (resolution instanceof Module) {
					if (resolution.chunk !== this && isChunkRendered(resolution.chunk as Chunk)) {
						const resolutionChunk = resolution.facadeChunk || (resolution.chunk as Chunk);
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

	private finaliseImportMetas(format: string): void {
		for (const [module, code] of this.renderedModuleSources) {
			for (const importMeta of module.importMetas) {
				importMeta.renderFinalMechanism(code, this.id, format, this.graph.pluginDriver);
			}
		}
	}

	private getChunkDependencyDeclarations(options: OutputOptions): ChunkDependencies {
		const reexportDeclarations = new Map<Chunk | ExternalModule, ReexportSpecifier[]>();

		for (let exportName of this.getExportNames()) {
			let exportChunk: Chunk | ExternalModule;
			let importName: string;
			let needsLiveBinding = false;
			if (exportName[0] === '*') {
				exportChunk = this.graph.moduleById.get(exportName.substr(1)) as ExternalModule;
				importName = exportName = '*';
			} else {
				const variable = this.exportNames[exportName];
				const module = variable.module;
				// skip local exports
				if (!module || module.chunk === this) continue;
				if (module instanceof Module) {
					exportChunk = module.chunk as Chunk;
					importName = exportChunk.getVariableExportName(variable);
					needsLiveBinding = variable.isReassigned;
				} else {
					exportChunk = module;
					importName = variable.name;
					needsLiveBinding = true;
				}
			}
			let reexportDeclaration = reexportDeclarations.get(exportChunk);
			if (!reexportDeclaration) reexportDeclarations.set(exportChunk, (reexportDeclaration = []));
			reexportDeclaration.push({ imported: importName, reexported: exportName, needsLiveBinding });
		}

		const renderedImports = new Set<Variable>();
		const dependencies: ChunkDependencies = [];

		for (const dep of this.dependencies) {
			const imports: ImportSpecifier[] = [];
			for (const variable of this.imports) {
				const renderedVariable =
					variable instanceof ExportDefaultVariable ? variable.getOriginalVariable() : variable;
				if (
					(variable.module instanceof Module
						? variable.module.chunk === dep
						: variable.module === dep) &&
					!renderedImports.has(renderedVariable)
				) {
					renderedImports.add(renderedVariable);
					imports.push({
						imported:
							variable.module instanceof ExternalModule
								? variable.name
								: ((variable.module as Module).chunk as Chunk).getVariableExportName(variable),
						local: variable.getName()
					});
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

			let id: string = undefined as any;
			let globalName: string = undefined as any;
			if (dep instanceof ExternalModule) {
				id = dep.renderPath;
				if (options.format === 'umd' || options.format === 'iife') {
					globalName = getGlobalName(
						dep,
						options.globals as GlobalsOption,
						this.graph,
						exportsNames || exportsDefault
					) as string;
				}
			}

			dependencies.push({
				exportsDefault,
				exportsNames,
				globalName,
				id, // chunk id updated on render
				imports: imports.length > 0 ? imports : (null as any),
				isChunk: dep instanceof Chunk,
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
				for (const declaration of variable.declarations) {
					if (
						declaration.parent instanceof FunctionDeclaration ||
						(declaration instanceof ExportDefaultDeclaration &&
							declaration.declaration instanceof FunctionDeclaration)
					) {
						hoisted = true;
						break;
					}
				}
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
					if (!resolution.chunk) {
						throw new Error();
					}
					if (resolution.chunk === this) {
						const namespace = resolution.getOrCreateNamespace();
						node.setResolution('named', namespace.getName());
					} else {
						node.setResolution(resolution.chunk.exportMode);
					}
				} else if (resolution instanceof ExternalModule) {
					node.setResolution('auto');
				} else {
					node.setResolution('named');
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
					!(exportVariable instanceof ExportDefaultVariable && exportVariable.hasId)
				) {
					exportVariable.setRenderNames('exports', exportName);
				} else {
					exportVariable.setRenderNames(null, null);
				}
			}
		}

		const usedNames = new Set<string>();
		if (this.needsExportsShim) {
			usedNames.add(MISSING_EXPORT_SHIM_VARIABLE);
		}
		if (options.format !== 'es') {
			usedNames.add('exports');
			if (options.format === 'cjs') {
				usedNames
					.add(INTEROP_DEFAULT_VARIABLE)
					.add('require')
					.add('module')
					.add('__filename')
					.add('__dirname');
			}
		}

		deconflictChunk(
			this.orderedModules,
			this.dependencies,
			this.imports,
			usedNames,
			options.format as string,
			options.interop !== false,
			this.graph.preserveModules
		);
	}

	private setUpChunkImportsAndExportsForModule(module: Module) {
		for (const variable of module.imports) {
			if ((variable.module as Module).chunk !== this) {
				this.imports.add(variable);
				if (variable.module instanceof Module) {
					(variable.module.chunk as Chunk).exports.add(variable);
				}
			}
		}
		if (
			module.isEntryPoint ||
			module.dynamicallyImportedBy.some(importer => importer.chunk !== this)
		) {
			const map = module.getExportNamesByVariable();
			for (const exportedVariable of map.keys()) {
				this.exports.add(exportedVariable);
				const exportingModule = exportedVariable.module;
				if (exportingModule && exportingModule.chunk && exportingModule.chunk !== this) {
					exportingModule.chunk.exports.add(exportedVariable);
				}
			}
		}
		if (module.getOrCreateNamespace().included) {
			for (const reexportName of Object.keys(module.reexports)) {
				const reexport = module.reexports[reexportName];
				const variable = reexport.module.getVariableForExportName(reexport.localName);
				if ((variable.module as Module).chunk !== this) {
					this.imports.add(variable);
					if (variable.module instanceof Module) {
						(variable.module.chunk as Chunk).exports.add(variable);
					}
				}
			}
		}
		for (const { node, resolution } of module.dynamicImports) {
			if (node.included && resolution instanceof Module && resolution.chunk === this)
				resolution.getOrCreateNamespace().include();
		}
	}
}
