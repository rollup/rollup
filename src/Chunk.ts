import { timeEnd, timeStart } from './utils/timers';
import MagicString, { Bundle as MagicStringBundle, SourceMap } from 'magic-string';
import Module from './Module';
import finalisers from './finalisers/index';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import transformBundle from './utils/transformBundle';
import collapseSourcemaps from './utils/collapseSourcemaps';
import error from './utils/error';
import { normalize, resolve, extname, dirname, relative, basename } from './utils/path';
import { OutputOptions, GlobalsOption } from './rollup/index';
import { RawSourceMap } from 'source-map';
import Graph from './Graph';
import ExternalModule from './ExternalModule';
import { isExportDefaultVariable } from './ast/variables/ExportDefaultVariable';
import Variable from './ast/variables/Variable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import { makeLegal } from './utils/identifierHelpers';
import LocalVariable from './ast/variables/LocalVariable';
import { NodeType } from './ast/nodes/index';
import { RenderOptions } from './utils/renderHelpers';
import { Addons } from './utils/addons';
import sha256 from 'hash.js/lib/hash/sha/256';
import { jsExts } from './utils/relativeId';
import ExternalVariable from './ast/variables/ExternalVariable';

export interface ModuleDeclarations {
	exports: ChunkExports;
	dependencies: ModuleDeclarationDependency[];
}

export interface ModuleDeclarationDependency {
	id: string;
	name: string;
	globalName: string;
	isChunk: boolean;
	// these used as interop signifiers
	exportsDefault: boolean;
	exportsNames: boolean;
	exportsNamespace: boolean;
	reexports?: ReexportSpecifier[];
	imports?: ImportSpecifier[];
}

export type ChunkDependencies = ModuleDeclarationDependency[];

export type ChunkExports = {
	local: string;
	exported: string;
	hoisted: boolean;
}[];

export interface ReexportSpecifier {
	reexported: string;
	imported: string;
}

export interface ImportSpecifier {
	local: string;
	imported: string;
}

export interface DynamicImportMechanism {
	left: string;
	right: string;
	interopLeft?: string;
	interopRight?: string;
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
	hasDynamicImport: boolean;
	indentString: string;
	usedModules: Module[];
	id: string;
	name: string;
	graph: Graph;
	private orderedModules: Module[];

	// this represents the chunk module wrappings
	// which form the output dependency graph
	private imports: Map<Variable, Module | ExternalModule>;
	// module can be in or out of chunk
	// if module is out of the chunk then it is a reexport
	private exports: Map<Variable, Module | ExternalModule>;
	private exportNames: { [name: string]: Variable };

	private dependencies: (ExternalModule | Chunk)[];
	// an entry module chunk is a chunk that exactly exports the exports of
	// an input entry point module
	entryModule: Module;
	isEntryModuleFacade: boolean;

	renderedHash: string;
	renderedSources: MagicString[];
	renderedSource: MagicStringBundle;
	renderedDeclarations: { dependencies: ChunkDependencies; exports: ChunkExports };

	constructor(graph: Graph, orderedModules: Module[]) {
		this.graph = graph;
		this.orderedModules = orderedModules;

		this.imports = new Map();
		this.exports = new Map();
		this.exportNames = Object.create(null);

		this.dependencies = undefined;
		this.entryModule = undefined;
		this.isEntryModuleFacade = false;
		for (let module of orderedModules) {
			module.chunk = this;
			if (module.isEntryPoint && !this.entryModule) {
				this.entryModule = module;
			}
		}
		this.id = undefined;
		this.renderedHash = undefined;
		this.renderedSources = undefined;
		this.renderedSource = undefined;
		this.renderedDeclarations = undefined;
		this.indentString = undefined;
		this.usedModules = undefined;
		this.hasDynamicImport = false;

		if (this.entryModule)
			this.name = makeLegal(basename(this.entryModule.chunkAlias || this.entryModule.id));
		else this.name = '__chunk_' + ++graph.curChunkIndex;
	}

	getImportIds(): string[] {
		return this.dependencies.map(module => module.id);
	}

	getExportNames(): string[] {
		return Object.keys(this.exportNames);
	}

	getModuleIds(): string[] {
		return this.orderedModules.map(module => module.id);
	}

	private inlineDeepModuleDependencies() {
		// if an entry point facade, inline the execution list to avoid loading latency
		if (this.isEntryModuleFacade) {
			const inlineDeepChunkDependencies = (dep: Chunk | ExternalModule) => {
				if (dep === this || this.dependencies.indexOf(dep) !== -1) {
					return;
				}
				this.dependencies.push(dep);
				if (dep instanceof Chunk) {
					dep.dependencies.forEach(inlineDeepChunkDependencies);
				}
			};
			for (let dep of this.dependencies) {
				if (dep instanceof Chunk) {
					dep.dependencies.forEach(inlineDeepChunkDependencies);
				}
			}
		} else {
			// shortcut cross-chunk relations can be added by traceExport
			for (let module of Array.from(this.imports.values())) {
				const chunkOrExternal = module instanceof Module ? module.chunk : module;
				if (this.dependencies.indexOf(chunkOrExternal) === -1) {
					this.dependencies.push(chunkOrExternal);
				}
			}
		}
	}

	private traceAllImports() {
		for (let module of this.orderedModules) {
			for (let importName of Object.keys(module.imports)) {
				const declaration = module.imports[importName];
				this.traceImport(declaration.name, declaration.module);
			}
		}
	}

	ensureExport(variable: Variable, module: Module | ExternalModule) {
		if (this.isEntryModuleFacade && !this.exports.has(variable)) {
			this.isEntryModuleFacade = false;
		}
		this.exports.set(variable, module);
	}

	linkFacade(entryFacade: Module) {
		this.dependencies = [entryFacade.chunk];
		this.entryModule = entryFacade;
		this.isEntryModuleFacade = true;
		this.traceAllImports();
		for (let exportName of entryFacade.getAllExports()) {
			const traced = this.traceExport(exportName, entryFacade);
			if (traced.variable) {
				if (traced.module.chunk) {
					traced.module.chunk.ensureExport(traced.variable, traced.module);
				}
				this.exports.set(traced.variable, traced.module);
			}
			this.exportNames[exportName] = traced.variable;
		}
	}

	link() {
		this.dependencies = [];
		for (let module of this.orderedModules) {
			for (let dep of module.dependencies) {
				if (dep.chunk === this) {
					continue;
				}
				let depModule: Chunk | ExternalModule;
				if (dep instanceof Module) {
					depModule = dep.chunk;
				} else {
					// unused pure external modules can be skipped
					if (!dep.used && this.graph.isPureExternalModule(dep.id)) continue;
					depModule = dep;
				}
				if (!this.dependencies.some(dep => dep === depModule)) {
					this.dependencies.push(depModule);
				}
			}
		}
		for (let module of Array.from(this.exports.values())) {
			if (module instanceof ExternalModule) {
				if (!this.dependencies.some(dep => dep === module)) {
					this.dependencies.push(module);
				}
			} else if (module.chunk !== this) {
				if (!this.dependencies.some(dep => dep === module.chunk)) {
					this.dependencies.push(module.chunk);
				}
			}
		}

		this.traceAllImports();

		if (this.entryModule) {
			const entryExportEntries = Array.from(this.entryModule.getAllExports().entries());
			const tracedExports = [];
			for (let [index, exportName] of entryExportEntries) {
				const traced = this.traceExport(exportName, this.entryModule);

				tracedExports[index] = traced;
				if (!traced.variable) continue;
				if (traced.module.chunk) traced.module.chunk.ensureExport(traced.variable, traced.module);
				const existingExport = this.exportNames[exportName];
				// tainted entryModule boundary
				if (existingExport && existingExport !== traced.variable) {
					return;
				}
			}
			this.isEntryModuleFacade = true;
			for (let [index, exportName] of entryExportEntries) {
				const traced = tracedExports[index];
				if (traced.variable) this.exports.set(traced.variable, traced.module);
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
			for (let importName of Object.keys(namespaceVariables)) {
				const original = namespaceVariables[importName];
				if (original.included) {
					if (traced.module.chunk) {
						traced.module.chunk.ensureExport(original, traced.module);
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
			traced.module.chunk.ensureExport(traced.variable, traced.module);
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
			if (module.isEntryPoint) return { variable: module.traceExport(name), module };
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
		for (let exportName of Object.keys(this.exportNames)) {
			if (this.exportNames[exportName] === variable) return exportName;
		}
	}

	generateExportNames(mangle: boolean) {
		mangle = false;
		const namedVariables: Variable[] = [];
		for (let exportName of Object.keys(this.exportNames)) {
			if (exportName[0] === '*') continue;
			const variable = this.exportNames[exportName];
			if (namedVariables.indexOf(variable) === -1) namedVariables.push(variable);
		}
		let i = 0,
			safeExportName: string;
		for (let variable of Array.from(this.exports.keys())) {
			if (namedVariables.indexOf(variable) !== -1) continue;
			if (mangle) {
				do {
					safeExportName = (i++).toString(36);
				} while (safeExportName.charCodeAt(0) > 47 && safeExportName.charCodeAt(0) < 58); // 0-9
			} else {
				i = 0;
				safeExportName = variable.name;
				while (this.exportNames[safeExportName]) {
					safeExportName = variable.name + '$' + ++i;
				}
			}
			this.exportNames[safeExportName] = variable;
		}
	}

	private prepareDynamicImports({ format }: OutputOptions) {
		const es = format === 'es';
		let dynamicImportMechanism: DynamicImportMechanism;
		let hasDynamicImports = false;
		if (!es) {
			if (format === 'cjs') {
				dynamicImportMechanism = {
					left: 'Promise.resolve(require(',
					right: '))',
					interopLeft: 'Promise.resolve({ default: require(',
					interopRight: ') })'
				};
			} else if (format === 'amd') {
				dynamicImportMechanism = {
					left: 'new Promise(function (resolve, reject) { require([',
					right: '], resolve, reject) })',
					interopLeft: 'new Promise(function (resolve, reject) { require([',
					interopRight: '], function (m) { resolve({ default: m }) }, reject) })'
				};
			} else if (format === 'system') {
				dynamicImportMechanism = {
					left: 'module.import(',
					right: ')'
				};
			}
		}
		for (let module of this.orderedModules) {
			for (let i = 0; i < module.dynamicImportResolutions.length; i++) {
				const node = module.dynamicImports[i];
				const resolution = module.dynamicImportResolutions[i].resolution;
				hasDynamicImports = true;

				if (!resolution) continue;

				if (resolution instanceof Module) {
					// if we have the module in the chunk, inline as Promise.resolve(namespace)
					// ensuring that we create a namespace import of it as well
					if (resolution.chunk === this) {
						const namespace = resolution.namespace();
						namespace.includeVariable();
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

		return hasDynamicImports && dynamicImportMechanism;
	}

	private finaliseDynamicImports() {
		for (let i = 0; i < this.orderedModules.length; i++) {
			const module = this.orderedModules[i];
			const code = this.renderedSources[i];
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

	private setIdentifierRenderResolutions(options: OutputOptions) {
		const used = Object.create(null);
		const es = options.format === 'es' || options.format === 'system';

		// ensure no conflicts with globals
		Object.keys(this.graph.scope.variables).forEach(name => (used[name] = 1));

		function getSafeName(name: string): string {
			let safeName = name;
			while (used[safeName]) {
				safeName = `${name}$${used[name]++}`;
			}
			used[safeName] = 1;
			return safeName;
		}

		// reserved internal binding names for system format wiring
		if (options.format === 'system') {
			used['_setter'] = used['_starExcludes'] = used['_$p'] = 1;
		}

		const toDeshadow: Set<string> = new Set();

		if (!es) {
			this.dependencies.forEach(module => {
				if ((<ExternalModule>module).isExternal) {
					const safeName = getSafeName(module.name);
					toDeshadow.add(safeName);
					module.name = safeName;
				}
			});
		}

		for (let exportName of Object.keys(this.exportNames)) {
			const exportVariable = this.exportNames[exportName];
			if (exportVariable) exportVariable.exportName = exportName;
		}

		Array.from(this.imports.entries()).forEach(([variable, module]) => {
			let safeName;
			if (module instanceof ExternalModule) {
				if (variable.name === '*') {
					safeName = module.name;
				} else if (variable.name === 'default') {
					if (module.exportsNamespace || (!es && module.exportsNames)) {
						safeName = `${module.name}__default`;
					} else {
						safeName = module.name;
					}
				} else {
					safeName = es ? variable.name : `${module.name}.${variable.name}`;
				}
				if (es) {
					safeName = getSafeName(safeName);
					toDeshadow.add(safeName);
				}
			} else if (es) {
				safeName = getSafeName(variable.name);
			} else {
				safeName = `${(<Module>module).chunk.name}.${module.chunk.getVariableExportName(variable)}`;
			}
			variable.setSafeName(safeName);
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
					if (es || !variable.isReassigned || variable.isId) {
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
			const namespace = module.namespace();
			if (namespace.needsNamespaceBlock) {
				namespace.setSafeName(getSafeName(namespace.name));
			}
		});

		this.graph.scope.deshadow(toDeshadow, this.orderedModules.map(module => module.scope));
	}

	private getChunkDependencyDeclarations(options: OutputOptions): ChunkDependencies {
		const reexportDeclarations: { [id: string]: ReexportSpecifier[] } = Object.create(null);

		for (let exportName of Object.keys(this.exportNames)) {
			let depId;
			let importName;
			if (exportName[0] === '*') {
				depId = exportName.substr(1);
				importName = exportName = '*';
			} else {
				const variable = this.exportNames[exportName];
				const module = this.exports.get(variable);
				// skip local exports
				if (module.chunk === this) continue;
				if (module instanceof Module) {
					depId = module.chunk.id;
					importName = module.chunk.getVariableExportName(variable);
				} else {
					depId = module.id;
					importName = variable.name;
				}
			}
			const exportDeclaration = (reexportDeclarations[depId] = reexportDeclarations[depId] || []);
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
				for (let [variable, module] of importSpecifiers) {
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

			let reexports = reexportDeclarations[dep.id];
			let exportsNames: boolean, exportsNamespace: boolean, exportsDefault: boolean;
			if (dep instanceof ExternalModule) {
				exportsNames = dep.exportsNames;
				exportsNamespace = dep.exportsNamespace;
				exportsDefault = 'default' in dep.declarations;
			} else {
				exportsNames = true;
				// we don't want any interop patterns to trigger
				exportsNamespace = false;
				exportsDefault = false;
			}

			let id: string;
			let globalName: string;
			if (dep instanceof ExternalModule) {
				id = dep.renderPath;
				if (options.format === 'umd' || options.format === 'iife') {
					globalName = getGlobalName(
						<ExternalModule>dep,
						options.globals,
						this.graph,
						exportsNames || exportsNamespace || exportsDefault
					);
				}
			}

			// id is left undefined for other chunks for now
			// this will be populated on render
			dependencies.push({
				id,
				globalName,
				name: dep.name,
				isChunk: !(<ExternalModule>dep).isExternal,
				exportsNames,
				exportsNamespace,
				exportsDefault,
				reexports,
				imports
			});
		});

		return dependencies;
	}

	private getChunkExportDeclarations(): ChunkExports {
		const exports: ChunkExports = [];
		for (let exportName of Object.keys(this.exportNames)) {
			if (exportName[0] === '*') continue;

			const variable = this.exportNames[exportName];
			const module = this.exports.get(variable);

			// skip external exports
			if (module.chunk !== this) continue;

			// determine if a hoisted export (function)
			let hoisted = false;
			if (variable instanceof LocalVariable) {
				variable.declarations.forEach(decl => {
					if (decl.type === NodeType.ExportDefaultDeclaration) {
						if (decl.declaration.type === NodeType.FunctionDeclaration) hoisted = true;
					} else if (decl.parent.type === NodeType.FunctionDeclaration) {
						hoisted = true;
					}
				});
			}

			const localName = variable.getName();

			exports.push({
				local: localName,
				exported: exportName === '*' ? localName : exportName,
				hoisted
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
		function visitDep(dep: Chunk, seen: Chunk[]) {
			if (seen.indexOf(dep) !== -1) return;
			seen.push(dep);

			hash.update(dep.dependencies.length);
			for (let subDep of dep.dependencies) {
				if (subDep instanceof ExternalModule) {
					hash.update(':' + subDep.renderPath);
					return;
				}
				hash.update(subDep.getRenderedHash());
				visitDep(subDep, seen);
			}
		}
		visitDep(this, []);

		return hash.digest('hex').substr(0, 8);
	}

	// prerender allows chunk hashes and names to be generated before finalizing
	preRender(options: OutputOptions) {
		let magicString = new MagicStringBundle({ separator: '\n\n' });
		this.usedModules = [];

		timeStart('render modules', 3);

		this.indentString = getIndentString(this.orderedModules, options);

		const renderOptions: RenderOptions = {
			legacy: options.legacy,
			freeze: options.freeze !== false,
			namespaceToStringTag: options.namespaceToStringTag === true,
			indent: this.indentString,
			systemBindings: options.format === 'system',
			importMechanism: this.graph.dynamicImport && this.prepareDynamicImports(options)
		};

		if (this.isEntryModuleFacade) this.inlineDeepModuleDependencies();

		this.setIdentifierRenderResolutions(options);

		let hoistedSource = '';

		this.renderedSources = [];

		for (let module of this.orderedModules) {
			const source = module.render(renderOptions);
			source.trim();
			this.renderedSources.push(source);

			const namespace = module.namespace();
			if (namespace.needsNamespaceBlock || !source.isEmpty()) {
				magicString.addSource(source);
				this.usedModules.push(module);

				if (namespace.needsNamespaceBlock) {
					const rendered = namespace.renderBlock(renderOptions);
					if (namespace.renderFirst()) hoistedSource += '\n' + rendered;
					else magicString.addSource(new MagicString(rendered));
				}
			}
		}

		// resolve external module paths
		for (let external of this.dependencies) {
			if (!(external instanceof ExternalModule)) continue;
			external.setRenderPath(options, this.entryModule && this.entryModule.id);
		}

		if (hoistedSource) magicString.prepend(hoistedSource + '\n\n');

		this.renderedSource = magicString.trim();

		if (
			this.getExportNames().length === 0 &&
			this.getImportIds().length === 0 &&
			this.renderedSource.isEmpty()
		) {
			this.graph.warn({
				code: 'EMPTY_BUNDLE',
				message: 'Generated an empty bundle'
			});
		}

		this.hasDynamicImport = !!renderOptions.importMechanism;

		this.renderedDeclarations = {
			dependencies: this.getChunkDependencyDeclarations(options),
			exports: this.getChunkExportDeclarations()
		};
	}

	generateNamePreserveModules(preserveModulesRelativeDir: string) {
		return (this.id = normalize(relative(preserveModulesRelativeDir, this.entryModule.id)));
	}

	generateName(
		pattern: string,
		addons: Addons,
		options: OutputOptions,
		existingNames?: { [name: string]: boolean }
	) {
		// replace any chunk replacements
		let outName = pattern.replace(/\[(hash|alias)\]/g, type => {
			switch (type) {
				case '[hash]':
					return this.computeFullHash(addons, options);
				case '[alias]':
					if (this.entryModule && this.entryModule.chunkAlias) return this.entryModule.chunkAlias;
					for (let module of this.orderedModules) {
						if (module.chunkAlias) return module.chunkAlias;
					}
					return 'chunk';
			}
		});

		if (existingNames) {
			if (!existingNames[outName]) {
				existingNames[outName] = true;
			} else {
				let ext = extname(outName);
				if (jsExts.indexOf(ext) !== -1) outName = outName.substr(0, outName.length - ext.length);
				else ext = '';
				let uniqueName,
					uniqueIndex = 1;
				while (existingNames[(uniqueName = outName + ++uniqueIndex + ext)]);
				existingNames[uniqueName] = true;
				outName = uniqueName;
			}
		}

		this.id = outName;

		timeEnd('render modules', 3);
	}

	render(options: OutputOptions, addons: Addons) {
		timeStart('render format', 3);

		if (!this.renderedSource)
			throw new Error('Internal error: Chunk render called before preRender');

		// Determine export mode - 'default', 'named', 'none'
		const exportMode = this.isEntryModuleFacade ? getExportMode(this, options) : 'named';

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
			if (dep instanceof ExternalModule) continue;
			let relPath = normalize(relative(dirname(this.id), dep.id));
			if (!relPath.startsWith('../')) relPath = './' + relPath;
			this.renderedDeclarations.dependencies[i].id = relPath;
		}

		if (this.graph.dynamicImport) this.finaliseDynamicImports();

		const magicString = finalise(
			this.renderedSource,
			{
				exportMode,
				indentString: this.indentString,
				intro: addons.intro,
				outro: addons.outro,
				dynamicImport: this.hasDynamicImport,
				dependencies: this.renderedDeclarations.dependencies,
				exports: this.renderedDeclarations.exports,
				graph: this.graph,
				isEntryModuleFacade: this.isEntryModuleFacade
			},
			options
		);

		timeEnd('render format', 3);

		if (addons.banner) magicString.prepend(addons.banner + '\n');
		if (addons.footer) magicString.append('\n' + addons.footer);

		const prevCode = magicString.toString();
		let map: SourceMap = null;
		const bundleSourcemapChain: RawSourceMap[] = [];

		return transformBundle(prevCode, this.graph.plugins, bundleSourcemapChain, options).then(
			(code: string) => {
				if (options.sourcemap) {
					timeStart('sourcemap', 3);

					let file = options.file ? options.sourcemapFile || options.file : this.id;
					if (file) file = resolve(typeof process !== 'undefined' ? process.cwd() : '', file);

					if (
						this.graph.hasLoaders ||
						this.graph.plugins.find(plugin => Boolean(plugin.transform || plugin.transformBundle))
					) {
						let decodedMap = magicString.generateDecodedMap({});
						map = collapseSourcemaps(
							this,
							file,
							decodedMap,
							this.usedModules,
							bundleSourcemapChain
						);
					} else {
						map = magicString.generateMap({ file, includeContent: true });
					}

					map.sources = map.sources.map(normalize);

					timeEnd('sourcemap', 3);
				}

				if (code[code.length - 1] !== '\n') code += '\n';
				return { code, map };
			}
		);
	}
}
