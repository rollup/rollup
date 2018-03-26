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
import ExternalVariable from './ast/variables/ExternalVariable';
import { makeLegal } from './utils/identifierHelpers';
import LocalVariable from './ast/variables/LocalVariable';
import { NodeType } from './ast/nodes/index';
import { RenderOptions } from './utils/renderHelpers';
import { Addons } from './utils/addons';
import sha256 from 'hash.js/lib/hash/sha/256';
import { jsExts } from './utils/relativeId';

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

	// map from variable exported by this chunk to its safe exported name
	private exportedVariableNames: Map<Variable, string>;
	private imports: {
		module: Chunk | ExternalModule;
		variables: {
			// the name of the export this import corresponds to
			name: string;
			module: Module | ExternalModule;
			variable: Variable;
		}[];
	}[];
	private exports: {
		[safeName: string]: {
			// module can be in or out of chunk
			// if module is out of the chunk then it is a reexport
			module: Module | ExternalModule;
			// exported name from source module
			name: string;
			variable: Variable;
		};
	};
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

		this.exportedVariableNames = new Map();
		this.imports = [];
		this.exports = {};

		this.dependencies = undefined;
		this.entryModule = undefined;
		this.isEntryModuleFacade = orderedModules.length === 0;
		orderedModules.forEach(module => {
			if (module.isEntryPoint) {
				if (!this.entryModule) {
					this.entryModule = module;
					this.isEntryModuleFacade = true;
				} else {
					this.isEntryModuleFacade = false;
				}
			}
			module.chunk = this;
		});
		this.id = undefined;
		this.renderedHash = undefined;
		this.renderedSources = undefined;
		this.renderedSource = undefined;
		this.renderedDeclarations = undefined;
		this.indentString = undefined;
		this.usedModules = undefined;
		this.hasDynamicImport = false;

		if (this.entryModule)
			this.name = makeLegal(basename(this.entryModule.alias || this.entryModule.id));
		else this.name = '__chunk_' + ++graph.curChunkIndex;
	}

	// ensure that the module exports or reexports the given variable
	// we don't replace reexports with the direct reexport from the final module
	// as this might result in exposing an internal module which taints an entryModule chunk
	ensureExport(module: Module | ExternalModule, variable: Variable, exportName: string): string {
		// assert(module.chunk === this || module.isExternal);
		let safeExportName = this.exportedVariableNames.get(variable);
		if (safeExportName) {
			return safeExportName;
		}

		let i = 0;
		safeExportName = exportName === '*' ? variable.name : exportName;
		while (this.exports[safeExportName]) {
			safeExportName = exportName + '$' + ++i;
		}
		variable.exportName = safeExportName;

		this.exports[safeExportName] = { module, name: safeExportName, variable };
		this.exportedVariableNames.set(variable, safeExportName);

		// if we've just exposed an export of a non-entry-point or had to use a safe name,
		// then note we are no longer an entry point chunk
		// we will then need an entry point facade if this is an entry point module
		if (this.isEntryModuleFacade && (!module.isEntryPoint || safeExportName !== exportName)) {
			this.isEntryModuleFacade = false;
		}

		return safeExportName;
	}

	generateEntryExports(entryModule: Module, onlyIncluded: boolean = false) {
		entryModule.getAllExports().forEach(exportName => {
			const traced = this.traceExport(entryModule, exportName);
			const variable = traced.module.traceExport(traced.name);
			if (onlyIncluded && !variable.included) {
				return;
			}
			let tracedName: string;
			if (traced.module.chunk === this || traced.module.isExternal) {
				tracedName = traced.name;
			} else {
				// if we exposed an export in another module ensure it is exported there
				tracedName = (<Module>traced.module).chunk.ensureExport(
					traced.module,
					variable,
					traced.name
				);
			}
			this.exports[exportName] = {
				module: traced.module,
				name: tracedName,
				variable
			};
			this.exportedVariableNames.set(variable, exportName);
		});
	}

	collectDependencies(entryFacade?: Module) {
		if (entryFacade) {
			this.dependencies = [entryFacade.chunk];
			this.entryModule = entryFacade;
			this.isEntryModuleFacade = true;
			return;
		}

		this.dependencies = [];

		this.orderedModules.forEach(module => {
			module.dependencies.forEach(dep => {
				if (dep.chunk === this) {
					return;
				}

				let depModule: Chunk | ExternalModule;
				if (dep instanceof Module) {
					depModule = dep.chunk;
				} else {
					// unused pure external modules can be skipped
					if (!dep.used && this.graph.isPureExternalModule(dep.id)) {
						return;
					}
					depModule = dep;
				}

				if (!this.dependencies.some(dep => dep === depModule)) {
					this.dependencies.push(depModule);
				}
			});
		});

		Object.keys(this.exports).forEach(exportName => {
			const expt = this.exports[exportName];
			if (expt.module instanceof ExternalModule) {
				if (!this.dependencies.some(dep => dep === expt.module)) {
					this.dependencies.push(expt.module);
				}
			} else if (expt.module.chunk !== this) {
				if (!this.dependencies.some(dep => dep === expt.module.chunk)) {
					this.dependencies.push(expt.module.chunk);
				}
			}
		});
	}

	generateImports() {
		this.orderedModules.forEach(module => {
			Object.keys(module.imports).forEach(importName => {
				const declaration = module.imports[importName];
				this.traceImport(declaration.module, declaration.name);
			});
		});
	}

	populateImport(
		variable: Variable,
		tracedExport: { name: string; module: Module | ExternalModule }
	) {
		if (!variable.included) {
			return;
		}

		let exportName: string, importModule: Chunk | ExternalModule;

		// ensure that the variable is exported by the other chunk to this one
		if (tracedExport.module instanceof Module) {
			importModule = tracedExport.module.chunk;
			exportName = tracedExport.module.chunk.ensureExport(
				tracedExport.module,
				variable,
				tracedExport.name
			);
		} else {
			importModule = tracedExport.module;
			exportName = variable.name;
		}

		// if we already import this variable skip
		if (this.imports.some(impt => impt.variables.some(v => v.variable === variable))) {
			return;
		}

		let impt = this.imports.find(impt => impt.module === importModule);
		if (!impt) {
			this.imports.push((impt = { module: importModule, variables: [] }));
		}

		impt.variables.push({
			module: tracedExport.module,
			variable: variable,
			name: exportName[0] === '*' ? '*' : exportName
		});
	}

	getImportIds(): string[] {
		return this.dependencies.map(module => module.id);
	}

	getExportNames(): string[] {
		return Object.keys(this.exports);
	}

	getModuleIds(): string[] {
		return this.orderedModules.map(module => module.id);
	}

	traceImport(module: Module | ExternalModule, exportName: string) {
		const tracedExport = this.traceExport(module, exportName);

		// ignore imports to modules already in this chunk
		if (!tracedExport || tracedExport.module.chunk === this) {
			return tracedExport;
		}

		const variable = tracedExport.module.traceExport(tracedExport.name);

		// namespace variable can indicate multiple imports
		if (tracedExport.name === '*') {
			this.populateImport(variable, tracedExport);
			Object.keys(
				(<NamespaceVariable>variable).originals || (<ExternalVariable>variable).module.declarations
			).forEach(importName => {
				const original = ((<NamespaceVariable>variable).originals ||
					(<ExternalVariable>variable).module.declarations)[importName];
				this.populateImport(original, {
					name: importName,
					module: tracedExport.module
				});
			});
			return tracedExport;
		}

		this.populateImport(variable, tracedExport);
		return tracedExport;
	}

	// trace a module export to its exposed chunk module export
	// either in this chunk or in another
	traceExport(
		module: Module | ExternalModule,
		name: string
	): { name: string; module: Module | ExternalModule } {
		if (name === '*') {
			return { name, module };
		}

		if (module instanceof ExternalModule) {
			return { name, module };
		}

		if (module.chunk !== this) {
			// we follow reexports if they are not entry points in the hope
			// that we can get an entry point reexport to reduce the chance of
			// tainting an entryModule chunk by exposing other unnecessary exports
			if (module.isEntryPoint) return { name, module };
			return module.chunk.traceExport(module, name);
		}

		const exportDeclaration = module.exports[name];
		if (exportDeclaration) {
			// if export binding is itself an import binding then continue tracing
			const importDeclaration = module.imports[exportDeclaration.localName];
			if (importDeclaration)
				return this.traceImport(importDeclaration.module, importDeclaration.name);
			return { name, module };
		}

		const reexportDeclaration = module.reexports[name];
		if (reexportDeclaration) {
			return this.traceExport(reexportDeclaration.module, reexportDeclaration.localName);
		}

		if (name === 'default') {
			return;
		}

		// external star exports
		if (name[0] === '*') {
			return { name: '*', module: this.graph.moduleById.get(name.substr(1)) };
		}

		// resolve known star exports
		for (let i = 0; i < module.exportAllModules.length; i++) {
			const exportAllModule = module.exportAllModules[i];
			// we have to ensure the right export all module
			if (exportAllModule.traceExport(name)) {
				return this.traceExport(exportAllModule, name);
			}
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

		this.imports.forEach(impt => {
			impt.variables.forEach(({ name, module, variable }) => {
				let safeName;
				if (module.isExternal) {
					if (variable.name === '*') {
						safeName = module.name;
					} else if (variable.name === 'default') {
						if (module.exportsNamespace || (!es && module.exportsNames)) {
							safeName = `${module.name}__default`;
						} else {
							safeName = module.name;
						}
					} else {
						safeName = es ? variable.name : `${module.name}.${name}`;
					}
					if (es) {
						safeName = getSafeName(safeName);
						toDeshadow.add(safeName);
					}
				} else if (es) {
					safeName = getSafeName(variable.name);
				} else {
					safeName = `${(<Module>module).chunk.name}.${name}`;
				}
				variable.setSafeName(safeName);
			});
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
						const safeExportName = this.exportedVariableNames.get(variable);
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

	private getCheckReexportDeclarations(): { [id: string]: ReexportSpecifier[] } {
		const reexportDeclarations: {
			[id: string]: ReexportSpecifier[];
		} = {};

		for (let name in this.exports) {
			const expt = this.exports[name];
			// skip local exports
			if (expt.module.chunk === this) continue;
			let depId;
			if (expt.module.isExternal) {
				depId = expt.module.id;
			} else {
				depId = (<Chunk>expt.module.chunk).id;
			}
			const exportDeclaration = (reexportDeclarations[depId] = reexportDeclarations[depId] || []);
			exportDeclaration.push({
				imported: expt.name,
				reexported: name[0] === '*' ? '*' : name
			});
		}

		return reexportDeclarations;
	}

	private getChunkDependencyDeclarations(options: OutputOptions): ChunkDependencies {
		const reexportDeclarations = this.getCheckReexportDeclarations();

		const dependencies: ChunkDependencies = [];

		this.dependencies.forEach(dep => {
			const importSpecifiers = this.imports.find(impt => impt.module === dep);

			let imports: ImportSpecifier[];
			if (importSpecifiers && importSpecifiers.variables.length) {
				imports = [];
				for (let i = 0; i < importSpecifiers.variables.length; i++) {
					const impt = importSpecifiers.variables[i];
					imports.push({
						local: impt.variable.safeName || impt.variable.name,
						imported: impt.name
					});
				}
			}

			let reexports = reexportDeclarations[dep.id];
			let exportsNames: boolean, exportsNamespace: boolean, exportsDefault: boolean;
			if ((<ExternalModule>dep).isExternal) {
				exportsNames = (<ExternalModule>dep).exportsNames;
				exportsNamespace = (<ExternalModule>dep).exportsNamespace;
				exportsDefault = 'default' in (<ExternalModule>dep).declarations;
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
		for (let name in this.exports) {
			const expt = this.exports[name];
			// skip external exports
			if (expt.module.chunk !== this) continue;

			// determine if a hoisted export (function)
			let hoisted = false;
			if (expt.variable instanceof LocalVariable) {
				expt.variable.declarations.forEach(decl => {
					if (decl.type === NodeType.ExportDefaultDeclaration) {
						if (decl.declaration.type === NodeType.FunctionDeclaration) hoisted = true;
					} else if (decl.parent.type === NodeType.FunctionDeclaration) {
						hoisted = true;
					}
				});
			}

			const localName = expt.variable.getName();

			exports.push({
				local: localName,
				exported: name === '*' ? localName : name,
				hoisted
			});
		}
		return exports;
	}

	private inlineDeepModuleDependencies() {
		// if an entry point facade, inline the execution list to avoid loading latency
		if (this.isEntryModuleFacade) {
			const inlineDeepChunkDependencies = (dep: Chunk | ExternalModule) => {
				if (dep === this || this.dependencies.indexOf(dep) !== -1) return;
				this.dependencies.push(dep);
				if (dep instanceof Chunk) dep.dependencies.forEach(inlineDeepChunkDependencies);
			};
			this.dependencies.forEach(dep => {
				if (dep instanceof Chunk) dep.dependencies.forEach(inlineDeepChunkDependencies);
			});
		} else {
			// shortcut cross-chunk relations can be added by traceExport
			this.imports.forEach(impt => {
				if (this.dependencies.indexOf(impt.module) === -1) this.dependencies.push(impt.module);
			});
		}
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

		this.inlineDeepModuleDependencies();
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
					return this.entryModule ? this.entryModule.alias : 'chunk';
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
