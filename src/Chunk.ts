import { timeEnd, timeStart } from './utils/flushTime';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import { blank, forOwn } from './utils/object';
import Module, { ModuleJSON } from './Module';
import finalisers from './finalisers/index';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { runSequence } from './utils/promise';
import transformBundle from './utils/transformBundle';
import collapseSourcemaps from './utils/collapseSourcemaps';
import callIfFunction from './utils/callIfFunction';
import error from './utils/error';
import { normalize, resolve } from './utils/path';
import { OutputOptions } from './rollup/index';
import { RawSourceMap } from 'source-map';
import Graph from './Graph';
import ExternalModule from './ExternalModule';
import ExportDefaultVariable from './ast/variables/ExportDefaultVariable';
import Variable from './ast/variables/Variable';
import NamespaceVariable from './ast/variables/NamespaceVariable';
import ExternalVariable from './ast/variables/ExternalVariable';
import { makeLegal } from './utils/identifierHelpers';
import LocalVariable from './ast/variables/LocalVariable';
import { NodeType } from './ast/nodes/index';
import { RenderOptions } from './utils/renderHelpers';

export interface ModuleDeclarations {
	exports: ChunkExports;
	dependencies: ModuleDeclarationDependency[];
}

export interface ModuleDeclarationDependency {
	id: string;
	name: string;
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

export default class Chunk {
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
	}

	setId(id: string) {
		this.id = id;
		this.name = makeLegal(id);
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
		safeExportName = exportName;
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

	getJsonModules(): ModuleJSON[] {
		return this.orderedModules.map(module => module.toJSON());
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

	collectAddon(
		initialAddon: string,
		addonName: 'banner' | 'footer' | 'intro' | 'outro',
		sep: string = '\n'
	) {
		return runSequence(
			[
				{ pluginName: 'rollup', source: initialAddon } as {
					pluginName: string;
					source: string | (() => string);
				}
			]
				.concat(
					this.graph.plugins.map((plugin, idx) => {
						return {
							pluginName: plugin.name || `Plugin at pos ${idx}`,
							source: plugin[addonName]
						};
					})
				)
				.map(addon => {
					addon.source = callIfFunction(addon.source);
					return addon;
				})
				.filter(addon => {
					return addon.source;
				})
				.map(({ pluginName, source }) => {
					return Promise.resolve(source).catch(err => {
						error({
							code: 'ADDON_ERROR',
							message: `Could not retrieve ${addonName}. Check configuration of ${pluginName}.
	Error Message: ${err.message}`
						});
					});
				})
		).then(addons => addons.filter(Boolean).join(sep));
	}

	private setDynamicImportResolutions({ format }: OutputOptions) {
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
		this.orderedModules.forEach(module => {
			module.dynamicImportResolutions.forEach((replacement, index) => {
				const node = module.dynamicImports[index];
				hasDynamicImports = true;

				if (!replacement) return;

				if (replacement instanceof Module) {
					// if we have the module in the chunk, inline as Promise.resolve(namespace)
					// ensuring that we create a namespace import of it as well
					if (replacement.chunk === this) {
						node.setResolution(replacement.namespace(), false);
						// for the module in another chunk, import that other chunk directly
					} else {
						node.setResolution(`"${replacement.chunk.id}"`, false);
					}
					// external dynamic import resolution
				} else if (replacement instanceof ExternalModule) {
					node.setResolution(`"${replacement.id}"`, true);
					// AST Node -> source replacement
				} else {
					node.setResolution(replacement, false);
				}
			});
		});
		if (hasDynamicImports) return dynamicImportMechanism;
	}

	private setIdentifierRenderResolutions(options: OutputOptions) {
		const used = blank();
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
			forOwn(module.scope.variables, variable => {
				if (variable.isDefault && (<ExportDefaultVariable>variable).referencesOriginal()) {
					variable.setSafeName(null);
					return;
				}
				if (!variable.isDefault || !(<ExportDefaultVariable>variable).hasId) {
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
				namespace.name = getSafeName(namespace.name);
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

	private getChunkDependencyDeclarations(): ChunkDependencies {
		const reexportDeclarations = this.getCheckReexportDeclarations();

		const dependencies: ChunkDependencies = [];

		// shortcut cross-chunk relations can be added by traceExport
		this.imports.forEach(impt => {
			if (this.dependencies.indexOf(impt.module) === -1) this.dependencies.push(impt.module);
		});

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

			dependencies.push({
				id: dep.id,
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

			exports.push({
				local: expt.variable.getName(),
				exported: name,
				hoisted
			});
		}
		return exports;
	}

	getModuleDeclarations(): ModuleDeclarations {
		return {
			dependencies: this.getChunkDependencyDeclarations(),
			exports: this.getChunkExportDeclarations()
		};
	}

	render(options: OutputOptions) {
		return Promise.resolve()
			.then(() => {
				return Promise.all([
					this.collectAddon(options.banner, 'banner'),
					this.collectAddon(options.footer, 'footer'),
					this.collectAddon(options.intro, 'intro', '\n\n'),
					this.collectAddon(options.outro, 'outro', '\n\n')
				]);
			})
			.then(([banner, footer, intro, outro]) => {
				// Determine export mode - 'default', 'named', 'none'
				const exportMode = this.isEntryModuleFacade ? getExportMode(this, options) : 'named';

				let magicString = new MagicStringBundle({ separator: '\n\n' });
				const usedModules: Module[] = [];

				timeStart('render modules');

				const renderOptions: RenderOptions = {
					legacy: this.graph.legacy,
					freeze: options.freeze !== false,
					systemBindings: options.format === 'system',
					importMechanism: this.graph.dynamicImport && this.setDynamicImportResolutions(options)
				};

				this.setIdentifierRenderResolutions(options);

				this.orderedModules.forEach(module => {
					const source = module.render(renderOptions);

					if (source.toString().length) {
						magicString.addSource(source);
						usedModules.push(module);
					}
				});

				if (!magicString.toString().trim() && this.getExportNames().length === 0) {
					this.graph.warn({
						code: 'EMPTY_BUNDLE',
						message: 'Generated an empty bundle'
					});
				}

				timeEnd('render modules');

				const indentString = getIndentString(magicString, options);

				const finalise = finalisers[options.format];
				if (!finalise) {
					error({
						code: 'INVALID_OPTION',
						message: `Invalid format: ${options.format} - valid options are ${Object.keys(
							finalisers
						).join(', ')}`
					});
				}

				timeStart('render format');

				const getPath = this.createGetPath(options);

				if (intro) intro += '\n\n';
				if (outro) outro = `\n\n${outro}`;

				magicString = finalise(
					this,
					(<any>magicString).trim(), // TODO TypeScript: Awaiting MagicString PR
					{
						exportMode,
						getPath,
						indentString,
						intro,
						outro,
						dynamicImport: !!renderOptions.importMechanism
					},
					options
				);

				timeEnd('render format');

				if (banner) magicString.prepend(banner + '\n');
				if (footer) (<any>magicString).append('\n' + footer); // TODO TypeScript: Awaiting MagicString PR

				const prevCode = magicString.toString();
				let map: RawSourceMap = null;
				const bundleSourcemapChain: RawSourceMap[] = [];

				return transformBundle(prevCode, this.graph.plugins, bundleSourcemapChain, options).then(
					(code: string) => {
						if (options.sourcemap) {
							timeStart('sourcemap');

							let file = options.file ? options.sourcemapFile || options.file : this.id;
							if (file) file = resolve(typeof process !== 'undefined' ? process.cwd() : '', file);

							if (
								this.graph.hasLoaders ||
								this.graph.plugins.find(plugin =>
									Boolean(plugin.transform || plugin.transformBundle)
								)
							) {
								map = <any>magicString.generateMap({}); // TODO TypeScript: Awaiting missing version in SourceMap type
								if (typeof map.mappings === 'string') {
									map.mappings = decode(map.mappings);
								}
								map = collapseSourcemaps(this, file, map, usedModules, bundleSourcemapChain);
							} else {
								map = <any>magicString.generateMap({ file, includeContent: true }); // TODO TypeScript: Awaiting missing version in SourceMap type
							}

							map.sources = map.sources.map(normalize);

							timeEnd('sourcemap');
						}

						if (code[code.length - 1] !== '\n') code += '\n';
						return { code, map } as { code: string; map: any }; // TODO TypeScript: Awaiting missing version in SourceMap type
					}
				);
			});
	}

	private createGetPath(options: OutputOptions) {
		const optionsPaths = options.paths;
		const getPath =
			typeof optionsPaths === 'function'
				? (id: string) =>
						optionsPaths(id, this.id) || this.graph.getPathRelativeToBaseDirname(id, this.id)
				: optionsPaths
					? (id: string) =>
							optionsPaths.hasOwnProperty(id)
								? optionsPaths[id]
								: this.graph.getPathRelativeToBaseDirname(id, this.id)
					: (id: string) => this.graph.getPathRelativeToBaseDirname(id, this.id);
		return getPath;
	}
}
