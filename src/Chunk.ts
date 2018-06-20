import sha256 from 'hash.js/lib/hash/sha/256';
import MagicString, { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import * as NodeType from './ast/nodes/NodeType';
import { UNDEFINED_EXPRESSION } from './ast/values';
import { isExportDefaultVariable } from './ast/variables/ExportDefaultVariable';
import ExternalVariable from './ast/variables/ExternalVariable';
import GlobalVariable from './ast/variables/GlobalVariable';
import LocalVariable from './ast/variables/LocalVariable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import Variable from './ast/variables/Variable';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import Graph from './Graph';
import Module from './Module';
import { GlobalsOption, OutputOptions, RawSourceMap, RenderedModule } from './rollup/types';
import { Addons } from './utils/addons';
import { toBase64 } from './utils/base64';
import collapseSourcemaps from './utils/collapseSourcemaps';
import error from './utils/error';
import getIndentString from './utils/getIndentString';
import { makeLegal } from './utils/identifierHelpers';
import { basename, dirname, normalize, relative, resolve } from './utils/path';
import { RenderOptions } from './utils/renderHelpers';
import { makeUnique, renderNamePattern } from './utils/renderNamePattern';
import { timeEnd, timeStart } from './utils/timers';
import transformChunk from './utils/transformChunk';

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
	if (typeof globals === 'function') return globals(module.id);
	if (globals) return globals[module.id];
	if (hasExports) {
		graph.warn({
			code: 'MISSING_GLOBAL_NAME',
			source: module.id,
			guess: module.name,
			message: `No name was provided for external module '${
				module.id
			}' in options.globals – guessing '${module.name}'`
		});
		return module.name;
	}
}

export default class Chunk {
	hasDynamicImport: boolean = false;
	indentString: string = undefined;
	exportMode: string = 'named';
	usedModules: Module[] = undefined;
	id: string = undefined;
	name: string;
	graph: Graph;
	orderedModules: Module[];
	linked = false;

	renderedModules: {
		[moduleId: string]: RenderedModule;
	};

	// this represents the chunk module wrappings
	// which form the output dependency graph
	private imports = new Map<Variable, Module | ExternalModule>();
	// module can be in or out of chunk
	// if module is out of the chunk then it is a reexport
	private exports = new Map<Variable, Module | ExternalModule>();
	private exportNames: { [name: string]: Variable } = Object.create(null);

	private dependencies: (ExternalModule | Chunk)[] = undefined;
	// an entry module chunk is a chunk that exactly exports the exports of
	// an input entry point module
	entryModule: Module = undefined;
	isEntryModuleFacade: boolean = false;
	isManualChunk: boolean = false;

	private renderedHash: string = undefined;
	private renderedModuleSources: MagicString[] = undefined;
	private renderedSource: MagicStringBundle = undefined;
	private renderedSourceLength: number = undefined;
	private renderedDeclarations: {
		dependencies: ChunkDependencies;
		exports: ChunkExports;
	} = undefined;
	isEmpty: boolean;

	constructor(graph: Graph, orderedModules: Module[]) {
		this.graph = graph;
		this.orderedModules = orderedModules;

		this.isEmpty = true;
		for (const module of orderedModules) {
			if (this.isEmpty && module.isIncluded()) {
				this.isEmpty = false;
			}
			if (module.chunkAlias) {
				this.isManualChunk = true;
			}
			module.chunk = this;
			if (module.isEntryPoint && !this.entryModule) {
				this.entryModule = module;
				this.isEntryModuleFacade = true;
			}
		}

		if (this.entryModule)
			this.name = makeLegal(
				basename(
					this.entryModule.chunkAlias || this.orderedModules[0].chunkAlias || this.entryModule.id
				)
			);
		else this.name = '__chunk_' + ++graph.curChunkIndex;
	}

	getImportIds(): string[] {
		return this.dependencies.map(module => module.id);
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

	// note we assume the facade module chunk is itself linked
	// with generateEntryExports called
	linkFacade(entryFacade: Module) {
		this.dependencies = [entryFacade.chunk];
		this.entryModule = entryFacade;
		this.isEntryModuleFacade = true;
		for (const exportName of entryFacade.getAllExports()) {
			const tracedVariable = entryFacade.traceExport(exportName);
			this.exports.set(tracedVariable, entryFacade);
			this.exportNames[exportName] = tracedVariable;
		}
	}

	link() {
		this.dependencies = [];
		for (const module of this.orderedModules) this.linkModule(module);
		this.linked = true;
	}

	linkModule(module: Module) {
		for (const dep of module.dependencies) {
			if (dep.chunk === this) {
				continue;
			}
			let depModule: Chunk | ExternalModule;
			if (dep instanceof Module) {
				depModule = dep.chunk;
			} else {
				// unused pure external modules can be skipped
				if (!dep.used && this.graph.isPureExternalModule(dep.id)) {
					continue;
				}
				depModule = dep;
			}
			if (this.dependencies.indexOf(depModule) === -1) {
				this.dependencies.push(depModule);
			}
		}
		for (const importName of Object.keys(module.imports)) {
			const declaration = module.imports[importName];
			this.traceImport(declaration.name, declaration.module);
		}
	}

	// Note preserveModules implementation is not a comprehensive technique
	// this will likely need to be reworked at some stage for edge cases
	populateEntryExports(preserveModules: boolean) {
		const entryExportEntries = Array.from(this.entryModule.getAllExports().entries());
		const tracedExports: { variable: Variable; module: Module | ExternalModule }[] = [];
		for (const [index, exportName] of entryExportEntries) {
			const traced = this.traceExport(exportName, this.entryModule);
			if (traced.variable && !traced.variable.included && !traced.variable.isExternal) {
				continue;
			}
			tracedExports[index] = traced;
			if (!traced.variable) {
				continue;
			}
			if (traced.module.chunk) {
				traced.module.chunk.exports.set(traced.variable, traced.module);
			}
			const existingExport = this.exportNames[exportName];
			// tainted entryModule boundary
			if (existingExport && existingExport !== traced.variable) {
				this.isEntryModuleFacade = false;
			}
		}
		// tainted if we've already exposed something not corresponding to entry exports
		for (const exposedVariable of Array.from(this.exports.keys())) {
			if (tracedExports.every(({ variable }) => variable !== exposedVariable)) {
				this.isEntryModuleFacade = false;
				return;
			}
		}

		if (preserveModules || this.isEntryModuleFacade) {
			for (const [index, exportName] of entryExportEntries) {
				const traced = tracedExports[index];
				if (!traced) {
					continue;
				}
				if (traced.variable) {
					if (!traced.variable.included && !traced.variable.isExternal) {
						continue;
					}
					this.exports.set(traced.variable, traced.module);
				}
				// can be undefined for star external exports (exportName[0] === '*')
				this.exportNames[exportName] = traced.variable;
			}
		}
	}

	private traceImport(exportName: string, module: Module | ExternalModule) {
		const traced = this.traceExport(exportName, module);

		// ignore imports to modules already in this chunk
		if (!traced || traced.module.chunk === this) {
			return traced;
		}

		// namespace variable can indicate multiple imports
		if (traced.variable.isNamespace) {
			const namespaceVariables =
				(<NamespaceVariable>traced.variable).originals ||
				(<ExternalVariable>traced.variable).module.declarations;
			for (const importName of Object.keys(namespaceVariables)) {
				const original = namespaceVariables[importName];
				if (original.included) {
					if (traced.module.chunk) {
						traced.module.chunk.exports.set(original, traced.module);
					}
					this.imports.set(original, traced.module);
				}
			}
		}

		if (!traced.variable.included) {
			return traced;
		}

		this.imports.set(traced.variable, traced.module);
		if (traced.module instanceof Module) {
			traced.module.chunk.exports.set(traced.variable, traced.module);
		}
		return traced;
	}

	// trace a module export to its exposed chunk module export
	// either in this chunk or in another
	traceExport(
		name: string,
		module: Module | ExternalModule
	): {
		variable: Variable;
		module: Module | ExternalModule;
	} {
		if (name === '*' || module instanceof ExternalModule) {
			return { variable: module.traceExport(name), module };
		}

		if (module.chunk !== this) {
			// we follow reexports if they are not entry points in the hope
			// that we can get an entry point reexport to reduce the chance of
			// tainting an entryModule chunk by exposing other unnecessary exports
			if (module.isEntryPoint && !module.chunk.isEmpty)
				return { variable: module.traceExport(name), module };
			return module.chunk.traceExport(name, module);
		}

		const exportDeclaration = module.exports[name];
		if (exportDeclaration) {
			// if export binding is itself an import binding then continue tracing
			const importDeclaration = module.imports[exportDeclaration.localName];
			if (importDeclaration) {
				return this.traceImport(importDeclaration.name, importDeclaration.module);
			}
			return { variable: module.traceExport(name), module };
		}

		const reexportDeclaration = module.reexports[name];
		if (reexportDeclaration) {
			return this.traceExport(reexportDeclaration.localName, reexportDeclaration.module);
		}

		if (name === 'default') {
			return;
		}

		// external star exports
		if (name[0] === '*') {
			return { variable: undefined, module: this.graph.moduleById.get(name.substr(1)) };
		}

		// resolve known star exports
		for (let i = 0; i < module.exportAllModules.length; i++) {
			const exportAllModule = module.exportAllModules[i];
			// we have to ensure the right export all module
			if (exportAllModule.traceExport(name)) {
				return this.traceExport(name, exportAllModule);
			}
		}
	}

	getVariableExportName(variable: Variable) {
		for (const exportName of Object.keys(this.exportNames)) {
			if (this.exportNames[exportName] === variable) return exportName;
		}
	}

	generateInternalExports(options: OutputOptions) {
		if (this.isEntryModuleFacade) return;
		const mangle = options.format === 'system' || options.format === 'es' || options.compact;
		let i = 0,
			safeExportName: string;
		this.exportNames = Object.create(null);
		const exportedVariables = Array.from(this.exports.keys());
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
			for (let i = 0; i < module.dynamicImportResolutions.length; i++) {
				const node = module.dynamicImports[i];
				const resolution = module.dynamicImportResolutions[i].resolution;
				this.hasDynamicImport = true;

				if (!resolution) continue;

				if (resolution instanceof Module) {
					// if we have the module in the chunk, inline as Promise.resolve(namespace)
					// ensuring that we create a namespace import of it as well
					if (resolution.chunk === this) {
						const namespace = resolution.getOrCreateNamespace();
						namespace.include();
						node.setResolution(false, namespace.getName());
						// for the module in another chunk, import that other chunk directly
					} else {
						node.setResolution(false);
					}
					// external dynamic import resolution
				} else if (resolution instanceof ExternalModule) {
					node.setResolution(true);
					// AST Node -> source replacement
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
			for (let j = 0; j < module.dynamicImportResolutions.length; j++) {
				const node = module.dynamicImports[j];
				const resolution = module.dynamicImportResolutions[j].resolution;

				if (!resolution) continue;
				if (resolution instanceof Module) {
					if (resolution.chunk !== this) {
						let relPath = normalize(relative(dirname(this.id), resolution.chunk.id));
						if (!relPath.startsWith('../')) relPath = './' + relPath;
						node.renderFinalResolution(code, `"${relPath}"`);
					}
				} else if (resolution instanceof ExternalModule) {
					node.renderFinalResolution(code, `"${resolution.id}"`);
					// AST Node -> source replacement
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
		const used = Object.create(null);
		const esm = options.format === 'es' || options.format === 'system';

		// ensure no conflicts with globals
		Object.keys(this.graph.scope.variables).forEach(name => (used[name] = 1));

		function getSafeName(name: string): string {
			let safeName = name;
			while (used[safeName]) {
				safeName = `${name}$${toBase64(used[name]++, true)}`;
			}
			used[safeName] = 1;
			return safeName;
		}

		// reserved internal binding names for system format wiring
		if (options.format === 'system') {
			used._setter = used._starExcludes = used._$p = 1;
		}

		const toDeshadow: Set<string> = new Set();

		if (!esm) {
			this.dependencies.forEach(module => {
				const safeName = getSafeName(module.name);
				toDeshadow.add(safeName);
				module.name = safeName;
			});
		}

		for (const exportName of Object.keys(this.exportNames)) {
			const exportVariable = this.exportNames[exportName];
			if (exportVariable && exportVariable.exportName !== exportName)
				exportVariable.exportName = exportName;
		}

		Array.from(this.imports.entries()).forEach(([variable, module]) => {
			let safeName;
			if (module instanceof ExternalModule) {
				if (variable.name === '*') {
					safeName = module.name;
				} else if (variable.name === 'default') {
					if (
						options.interop !== false &&
						(module.exportsNamespace || (!esm && module.exportsNames))
					) {
						safeName = `${module.name}__default`;
					} else {
						safeName = module.name;
					}
				} else {
					safeName = esm ? variable.name : `${module.name}.${variable.name}`;
				}
				if (esm) {
					safeName = getSafeName(safeName);
					toDeshadow.add(safeName);
				}
			} else if (esm) {
				safeName = getSafeName(variable.name);
				toDeshadow.add(safeName);
			} else {
				const chunk = module.chunk;
				if (chunk.exportMode === 'default') safeName = chunk.name;
				else safeName = `${chunk.name}.${module.chunk.getVariableExportName(variable)}`;
			}
			if (safeName) variable.setSafeName(safeName);
		});

		this.orderedModules.forEach(module => {
			Object.keys(module.scope.variables).forEach(variableName => {
				const variable = module.scope.variables[variableName];
				if (isExportDefaultVariable(variable) && variable.referencesOriginal()) {
					variable.setSafeName(null);
					return;
				}
				if (!(isExportDefaultVariable(variable) && variable.hasId)) {
					let safeName;
					if (esm || !variable.isReassigned || variable.isId) {
						safeName = getSafeName(variable.name);
					} else {
						const safeExportName = variable.exportName;
						if (safeExportName) {
							safeName = `exports.${safeExportName}`;
						} else {
							safeName = getSafeName(variable.name);
						}
					}
					variable.setSafeName(safeName);
				}
			});

			// deconflict reified namespaces
			const namespace = module.getOrCreateNamespace();
			if (namespace.needsNamespaceBlock) {
				namespace.setSafeName(getSafeName(namespace.name));
			}
		});

		this.graph.scope.deshadow(toDeshadow, this.orderedModules.map(module => module.scope));
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
				const module = this.exports.get(variable);
				// skip local exports
				if (module.chunk === this) continue;
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

		const dependencies: ChunkDependencies = [];

		this.dependencies.forEach(dep => {
			const importSpecifiers = Array.from(this.imports.entries()).filter(
				([, module]) => (module instanceof Module ? module.chunk === dep : module === dep)
			);

			let imports: ImportSpecifier[];
			if (importSpecifiers.length) {
				imports = [];
				for (const [variable, module] of importSpecifiers) {
					const local = variable.safeName || variable.name;
					let imported;
					if (module instanceof ExternalModule) {
						imported = variable.name;
					} else {
						imported = module.chunk.getVariableExportName(variable);
					}
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
				id = dep.renderPath || dep.setRenderPath(options, inputBase);
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
				name: dep.name,
				isChunk: !(<ExternalModule>dep).isExternal,
				exportsNames,
				exportsDefault,
				reexports,
				imports
			});
		});

		return dependencies;
	}

	private getChunkExportDeclarations(): ChunkExports {
		const exports: ChunkExports = [];
		for (const exportName of Object.keys(this.exportNames)) {
			if (exportName[0] === '*') continue;

			const variable = this.exportNames[exportName];
			const module = this.exports.get(variable);

			// skip external exports
			if (module.chunk !== this) continue;

			// determine if a hoisted export (function)
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

	getRenderedHash() {
		if (this.renderedHash) return this.renderedHash;
		const hash = sha256();
		hash.update(this.renderedSource.toString());
		return (this.renderedHash = hash.digest('hex'));
	}

	/*
	 * Chunk dependency output graph post-visitor
	 * Visitor can return "true" to indicate a propogated stop condition
	 */
	postVisitChunkDependencies(visitor: (dep: Chunk | ExternalModule) => any): boolean {
		const seen = new Set<Chunk | ExternalModule>();
		// add in hashes of all dependent chunks and resolved external ids
		function visitDep(dep: Chunk | ExternalModule): boolean {
			if (seen.has(dep)) return;
			seen.add(dep);
			if (dep instanceof Chunk) {
				for (const subDep of dep.dependencies) {
					if (visitDep(subDep)) return true;
				}
			}
			return visitor(dep) === true;
		}
		return visitDep(this);
	}

	private computeFullHash(addons: Addons, options: OutputOptions): string {
		const hash = sha256();

		// own rendered source, except for finalizer wrapping
		hash.update(this.getRenderedHash());

		// hash of addons
		hash.update(addons.hash);

		// output options
		hash.update(options.format);

		// import names of dependency sources
		hash.update(this.dependencies.length);

		// add in hashes of all dependent chunks and resolved external ids
		this.postVisitChunkDependencies(dep => {
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

		this.prepareDynamicImports();

		const renderOptions: RenderOptions = {
			compact: options.compact,
			freeze: options.freeze !== false,
			esModule: options.esModule !== false,
			namespaceToStringTag: options.namespaceToStringTag === true,
			indent: this.indentString,
			format: options.format
		};

		// if an entry point facade, inline the execution list to avoid loading latency
		if (this.isEntryModuleFacade) {
			for (const dep of this.dependencies) {
				if (dep instanceof Chunk) this.inlineChunkDependencies(dep, true);
			}
		} else {
			// shortcut cross-chunk relations can be added by traceExport
			for (const module of Array.from(this.imports.values())) {
				const chunkOrExternal = module instanceof Module ? module.chunk : module;
				if (this.dependencies.indexOf(chunkOrExternal) === -1) {
					this.dependencies.push(chunkOrExternal);
				}
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

		this.setIdentifierRenderResolutions(options);

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
			if (namespace.needsNamespaceBlock || !source.isEmpty()) {
				magicString.addSource(source);
				this.usedModules.push(module);

				if (namespace.needsNamespaceBlock) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += n + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
			}
		}

		if (hoistedSource) magicString.prepend(hoistedSource + n + n);

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
		if (this.isEntryModuleFacade || chunk.isEntryModuleFacade)
			throw new Error('Internal error: Code splitting chunk merges not supported for facades');

		for (const module of chunk.orderedModules) {
			module.chunk = this;
			this.orderedModules.push(module);
		}

		for (const [variable, module] of Array.from(chunk.imports.entries())) {
			if (!this.imports.has(variable) && module.chunk !== this) {
				this.imports.set(variable, module);
			}
		}

		// NB detect when exported variables are orphaned by the merge itself
		// (involves reverse tracing dependents)
		for (const [variable, module] of Array.from(chunk.exports.entries())) {
			if (!this.exports.has(variable)) {
				this.exports.set(variable, module);
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
			into.name = this.name;
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

	generateIdPreserveModules(preserveModulesRelativeDir: string) {
		return (this.id = normalize(relative(preserveModulesRelativeDir, this.entryModule.id)));
	}

	generateId(
		pattern: string,
		patternName: string,
		addons: Addons,
		options: OutputOptions,
		existingNames: { [name: string]: any }
	) {
		const outName = makeUnique(
			renderNamePattern(pattern, patternName, type => {
				switch (type) {
					case 'hash':
						return this.computeFullHash(addons, options);
					case 'name':
						if (this.entryModule && this.entryModule.chunkAlias) return this.entryModule.chunkAlias;
						for (const module of this.orderedModules) {
							if (module.chunkAlias) return module.chunkAlias;
						}
						return 'chunk';
				}
			}),
			existingNames
		);

		this.id = outName;
	}

	render(options: OutputOptions, addons: Addons) {
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

		const magicString = finalise(
			this.renderedSource,
			{
				indentString: this.indentString,
				namedExportsMode: this.exportMode !== 'default',
				hasExports,
				intro: addons.intro,
				outro: addons.outro,
				dynamicImport: this.hasDynamicImport,
				needsAmdModule,
				dependencies: this.renderedDeclarations.dependencies,
				exports: this.renderedDeclarations.exports,
				graph: this.graph,
				isEntryModuleFacade: this.isEntryModuleFacade
			},
			options
		);
		if (addons.banner) magicString.prepend(addons.banner);
		if (addons.footer) magicString.append(addons.footer);
		const prevCode = magicString.toString();

		timeEnd('render format', 3);

		let map: SourceMap = null;
		const chunkSourcemapChain: RawSourceMap[] = [];

		return transformChunk(this.graph, this, prevCode, chunkSourcemapChain, options).then(
			(code: string) => {
				if (options.sourcemap) {
					timeStart('sourcemap', 3);

					let file: string;
					if (options.file) file = resolve(options.sourcemapFile || options.file);
					else if (options.dir) file = resolve(options.dir, this.id);
					else file = resolve(this.id);

					if (
						this.graph.hasLoaders ||
						this.graph.plugins.find(plugin => Boolean(plugin.transform || plugin.transformBundle))
					) {
						const decodedMap = magicString.generateDecodedMap({});
						map = collapseSourcemaps(this, file, decodedMap, this.usedModules, chunkSourcemapChain);
					} else {
						map = magicString.generateMap({ file, includeContent: true });
					}

					map.sources = map.sources.map(normalize);

					timeEnd('sourcemap', 3);
				}

				if (options.compact !== true && code[code.length - 1] !== '\n') code += '\n';

				return { code, map };
			}
		);
	}
}
