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
import renderChunk from './utils/renderChunk';
import { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { sanitizeFileName } from './utils/sanitizeFileName';
import { timeEnd, timeStart } from './utils/timers';
import { MISSING_EXPORT_SHIM_VARIABLE } from './utils/variableNames';

export interface ModuleDeclarations {
	exports: ChunkExports;
	dependencies: ModuleDeclarationDependency[];
}

export interface ModuleDeclarationDependency {
	id: string;
	namedExportsMode: boolean;
	name: string;
	globalName: string;
	isChunk: boolean;
	// these used as interop signifiers
	exportsDefault: boolean;
	exportsNames: boolean;
	reexports?: ReexportSpecifier[];
	imports?: ImportSpecifier[];
}

export type ChunkDependencies = ModuleDeclarationDependency[];

export type ChunkExports = {
	local: string;
	exported: string;
	hoisted: boolean;
	uninitialized: boolean;
}[];

export interface ReexportSpecifier {
	reexported: string;
	imported: string;
}

export interface ImportSpecifier {
	local: string;
	imported: string;
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
			source: module.id,
			guess: module.variableName,
			message: `No name was provided for external module '${
				module.id
			}' in output.globals – guessing '${module.variableName}'`
		});
		return module.variableName;
	}
}

export default class Chunk {
	execIndex: number;
	entryModules: Module[] = [];
	exportMode: string = 'named';
	facadeModule: Module | null = null;
	graph: Graph;
	hasDynamicImport: boolean = false;
	id: string = undefined;
	indentString: string = undefined;
	isEmpty: boolean;
	isManualChunk: boolean = false;
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
	private needsExportsShim: boolean = false;
	private renderedDeclarations: {
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	} = undefined;
	private renderedHash: string = undefined;
	private renderedModuleSources: MagicString[] = undefined;
	private renderedSource: MagicStringBundle | null = null;
	private renderedSourceLength: number = undefined;

	constructor(graph: Graph, orderedModules: Module[]) {
		this.graph = graph;
		this.orderedModules = orderedModules;
		this.execIndex = orderedModules.length > 0 ? orderedModules[0].execIndex : Infinity;

		this.isEmpty = true;
		for (const module of orderedModules) {
			if (this.isEmpty && module.isIncluded()) {
				this.isEmpty = false;
			}
			if (module.chunkAlias) {
				this.isManualChunk = true;
			}
			module.chunk = this;
			if (
				module.isEntryPoint ||
				module.dynamicallyImportedBy.some(module => orderedModules.indexOf(module) === -1)
			) {
				this.entryModules.push(module);
			}
		}

		if (this.entryModules.length > 0) {
			this.variableName = makeLegal(
				basename(
					this.entryModules.map(module => module.chunkAlias).find(Boolean) ||
						this.entryModules[0].id
				)
			);
		} else this.variableName = '__chunk_' + ++graph.curChunkIndex;
	}

	getImportIds(): string[] {
		return this.dependencies.map(chunk => chunk.id);
	}

	getDynamicImportIds(): string[] {
		return this.dynamicDependencies.map(chunk => chunk.id).filter(Boolean);
	}

	getExportNames(): string[] {
		return Object.keys(this.exportNames);
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

	link() {
		const dependencies: Set<Chunk | ExternalModule> = new Set();
		const dynamicDependencies: Set<Chunk | ExternalModule> = new Set();
		for (const module of this.orderedModules) {
			this.addChunksFromDependencies(module.dependencies, dependencies);
			this.addChunksFromDependencies(module.dynamicDependencies, dynamicDependencies);
			this.setUpModuleImports(module);
		}
		this.dependencies = Array.from(dependencies);
		this.dynamicDependencies = Array.from(dynamicDependencies);
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
				if (!depModule.used && this.graph.isPureExternalModule(depModule.id)) {
					continue;
				}
				dependency = depModule;
			}
			chunkDependencies.add(dependency);
		}
	}

	private setUpModuleImports(module: Module) {
		for (const variable of Array.from(module.imports)) {
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

	generateEntryExportsOrMarkAsTainted() {
		const exportVariableMaps = this.entryModules.map(module => ({
			module,
			map: this.getVariableExportNamesForModule(module)
		}));
		for (const { map } of exportVariableMaps) {
			for (const exposedVariable of Array.from(map.keys())) {
				this.exports.add(exposedVariable);
			}
		}
		const exposedVariables = Array.from(this.exports);
		checkNextEntryModule: for (const { map, module } of exportVariableMaps) {
			if (!this.graph.preserveModules) {
				for (const exposedVariable of exposedVariables) {
					if (!map.has(exposedVariable)) {
						continue checkNextEntryModule;
					}
				}
			}
			this.facadeModule = module;
			for (const [variable, exportNames] of Array.from(map)) {
				for (const exportName of exportNames) {
					this.exportNames[exportName] = variable;
				}
			}
			return;
		}
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

	getVariableExportName(variable: Variable) {
		if (this.graph.preserveModules && variable instanceof NamespaceVariable) {
			return '*';
		}
		for (const exportName of Object.keys(this.exportNames)) {
			if (this.exportNames[exportName] === variable) return exportName;
		}
	}

	generateInternalExports(options: OutputOptions) {
		if (this.facadeModule !== null) return;
		const mangle = options.format === 'system' || options.format === 'es' || options.compact;
		let i = 0,
			safeExportName: string;
		this.exportNames = Object.create(null);
		const exportedVariables = Array.from(this.exports);
		if (mangle) {
			for (const variable of exportedVariables) {
				safeExportName = toBase64(++i);
				// skip past leading number identifiers
				if (safeExportName.charCodeAt(0) === 49 /* '1' */) {
					i += 9 * 64 ** (safeExportName.length - 1);
					safeExportName = toBase64(i);
				}
				this.exportNames[safeExportName] = variable;
			}
		} else {
			for (const variable of exportedVariables) {
				i = 0;
				safeExportName = variable.name;
				while (this.exportNames[safeExportName]) {
					safeExportName = variable.name + '$' + ++i;
				}
				this.exportNames[safeExportName] = variable;
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
					node.setResolution(true);
				} else {
					node.setResolution(false);
				}
			}
		}
	}

	private finaliseDynamicImports() {
		for (let i = 0; i < this.orderedModules.length; i++) {
			const module = this.orderedModules[i];
			const code = this.renderedModuleSources[i];
			for (const { node, resolution } of module.dynamicImports) {
				if (!resolution) continue;
				if (resolution instanceof Module) {
					if (!resolution.chunk.isEmpty && resolution.chunk !== this) {
						const resolutionChunk = resolution.facadeChunk || resolution.chunk;
						let relPath = normalize(relative(dirname(this.id), resolutionChunk.id));
						if (!relPath.startsWith('../')) relPath = './' + relPath;
						node.renderFinalResolution(code, `'${relPath}'`);
					}
				} else if (resolution instanceof ExternalModule) {
					node.renderFinalResolution(code, `'${resolution.id}'`);
				} else {
					node.renderFinalResolution(code, resolution);
				}
			}
		}
	}

	private finaliseImportMetas(options: OutputOptions): boolean {
		let usesMechanism = false;
		for (let i = 0; i < this.orderedModules.length; i++) {
			const module = this.orderedModules[i];
			const code = this.renderedModuleSources[i];
			for (const importMeta of module.importMetas) {
				if (importMeta.renderFinalMechanism(code, this.id, options.format, options.compact))
					usesMechanism = true;
			}
		}
		return usesMechanism;
	}

	private setIdentifierRenderResolutions(options: OutputOptions) {
		for (const exportName of Object.keys(this.exportNames)) {
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

	private getChunkDependencyDeclarations(
		options: OutputOptions,
		inputBase: string
	): ChunkDependencies {
		const reexportDeclarations = new Map<Chunk | ExternalModule, ReexportSpecifier[]>();

		for (let exportName of Object.keys(this.exportNames)) {
			let exportModule: Chunk | ExternalModule;
			let importName: string;
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
				} else {
					exportModule = module;
					importName = variable.name;
				}
			}
			let exportDeclaration = reexportDeclarations.get(exportModule);
			if (!exportDeclaration) reexportDeclarations.set(exportModule, (exportDeclaration = []));
			exportDeclaration.push({ imported: importName, reexported: exportName });
		}

		const importsAsArray = Array.from(this.imports);
		const dependencies: ChunkDependencies = [];

		for (const dep of this.dependencies) {
			const imports: ImportSpecifier[] = [];
			for (const variable of importsAsArray) {
				if (
					(variable.module instanceof Module
						? variable.module.chunk === dep
						: variable.module === dep) &&
					!(
						variable instanceof ExportDefaultVariable &&
						variable.referencesOriginal() &&
						this.imports.has(variable.getOriginalVariable())
					)
				) {
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
				id = dep.setRenderPath(options, inputBase);
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
				id, // chunk id updated on render
				namedExportsMode,
				globalName,
				name: dep.variableName,
				isChunk: !(<ExternalModule>dep).isExternal,
				exportsNames,
				exportsDefault,
				reexports,
				imports: imports.length > 0 ? imports : null
			});
		}

		return dependencies;
	}

	private getChunkExportDeclarations(): ChunkExports {
		const exports: ChunkExports = [];
		for (const exportName of Object.keys(this.exportNames)) {
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
				local: localName,
				exported: exportName === '*' ? localName : exportName,
				hoisted,
				uninitialized
			});
		}
		return exports;
	}

	getRenderedHash(): string {
		if (this.renderedHash) return this.renderedHash;
		if (!this.renderedSource) return '';
		const hash = sha256();
		hash.update(this.renderedSource.toString());
		hash.update(Object.keys(this.exportNames).join(','));
		return (this.renderedHash = hash.digest('hex'));
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
			format: options.format,
			freeze: options.freeze !== false,
			indent: this.indentString,
			namespaceToStringTag: options.namespaceToStringTag === true,
			varOrConst: options.preferConst ? 'const' : 'var'
		};

		// Make sure the direct dependencies of a chunk are present to maintain execution order
		for (const { module } of Array.from(this.imports)) {
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
				renderedExports,
				removedExports,
				renderedLength: source.length(),
				originalLength: module.originalCode.length
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

		this.renderedDeclarations = {
			dependencies: this.getChunkDependencyDeclarations(options, inputBase),
			exports: this.exportMode === 'none' ? [] : this.getChunkExportDeclarations()
		};

		timeEnd('render modules', 3);
	}

	getRenderedSourceLength() {
		if (this.renderedSourceLength !== undefined) return this.renderedSourceLength;
		return (this.renderedSourceLength = this.renderedSource.length());
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

		for (const variable of Array.from(chunk.imports)) {
			if (!this.imports.has(variable) && variable.module.chunk !== this) {
				this.imports.add(variable);
			}
		}

		// NB detect when exported variables are orphaned by the merge itself
		// (involves reverse tracing dependents)
		for (const variable of Array.from(chunk.exports)) {
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

	getChunkName(): string {
		return this.chunkName || (this.chunkName = this.computeChunkName());
	}

	private computeChunkName(): string {
		if (this.facadeModule !== null && this.facadeModule.chunkAlias) {
			return sanitizeFileName(this.facadeModule.chunkAlias);
		}
		for (const module of this.orderedModules) {
			if (module.chunkAlias) return sanitizeFileName(module.chunkAlias);
		}
		return 'chunk';
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
				).join(', ')}`
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

		this.finaliseDynamicImports();
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
			graph: this.graph,
			chunk: this,
			renderChunk: outputChunk,
			code: prevCode,
			sourcemapChain: chunkSourcemapChain,
			options
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
}
