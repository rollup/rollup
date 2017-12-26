import { timeStart, timeEnd } from './utils/flushTime';
import { decode } from 'sourcemap-codec';
import { Bundle as MagicStringBundle } from 'magic-string';
import { find } from './utils/array';
import { keys, blank, forOwn } from './utils/object';
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
import { DynamicImportMechanism } from './ast/nodes/Import';

export type BundleDependencies = {
	id: string;
	name: string;
	isBundle: boolean;
	reexports?: ReexportSpecifier[];
	imports?: ImportSpecifier[];
}[];

export type BundleExports = {
	local: string;
	exported: string;
}[];

export interface ReexportSpecifier {
	reexported: string;
	imported: string;
};
export interface ImportSpecifier {
	local: string;
	imported: string;
};

export default class Bundle {
	id: string;
	name: string;
	graph: Graph;
	orderedModules: Module[];

	// this represents the bundle module wrappings
	// which form the output dependency graph

	// map from variable exported by this bundle to its safe exported name
	exportedVariables: Map<Variable, string>;
	imports: {
		module: Bundle | ExternalModule;
		variables: {
			// the name of the export this import corresponds to
			name: string;
			module: Module | ExternalModule;
			variable: Variable;
		}[];
	}[];
	exports: {
		[safeName: string]: {
			// module can be in or out of bundle
			// if module is out of the bundle then it is a reexport
			module: Module | ExternalModule;
			// exported name from source module
			name: string;
			variable: Variable;
		}
	}
	dependencies: (ExternalModule | Bundle)[];
	externalModules: ExternalModule[];
	// an entry module bundle is a bundle that exactly exports the exports of
	// an input entry point module
	entryModule: Module;
	entryModuleFacade: boolean;

	constructor (graph: Graph, id: string, orderedModules: Module[]) {
		this.setId(id);
		this.graph = graph;
		this.orderedModules = orderedModules;

		this.exportedVariables = new Map();
		this.imports = [];
		this.exports = {};
		this.externalModules = undefined;

		this.dependencies = undefined;
		this.entryModule = undefined;
		this.entryModuleFacade = false;
		orderedModules.forEach(module => {
			if (module.isEntryPoint) {
				if (!this.entryModule) {
					this.entryModule = module;
					this.entryModuleFacade = true;
				} else {
					this.entryModuleFacade = false;
				}
			}
			module.bundle = this;
		});
	}

	setId (id: string) {
		this.id = id;
		this.name = makeLegal(id);
	}

	// ensure that the module exports or reexports the given variable
	// we don't replace reexports with the direct reexport from the final module
	// as this might result in exposing an internal module which taints an entryModule bundle
	ensureExport (module: Module | ExternalModule, variable: Variable): string {
		let safeExportName = this.exportedVariables.get(variable);
		if (safeExportName) {
			return safeExportName;
		}

		let i = 0;
		if (variable.exportName) {
			safeExportName = variable.exportName;
		} else {
			safeExportName = variable.exportName = variable.name;
		}

		let curExport = this.exports[safeExportName];
		while (curExport) {
			safeExportName = (variable.exportName || variable.name) + '$' + ++i;
			curExport = this.exports[safeExportName];
		}

		curExport = this.exports[safeExportName] = { module, name: undefined, variable };
		this.exportedVariables.set(variable, safeExportName);

		// if we've just exposed an export of a non-entry-point,
		// then note we are no longer an entry point bundle
		// we will then need an entry point facade if this is an entry point module
		if (this.entryModuleFacade && module.bundle === this && !module.isEntryPoint) {
			this.entryModuleFacade = false;
		}

		// if we are reexporting a module in another bundle
		// then we also have to ensure it is an export there too
		// and note the name it comes from
		if (module.bundle !== this && !module.isExternal) {
			curExport.name = (<Module>module).bundle.ensureExport(module, variable);
		}
		else {
			curExport.name = safeExportName;
		}

		return safeExportName;
	}

	generateEntryExports (entryModule: Module) {
		entryModule.getAllExports().forEach(exportName => {
			const traced = this.traceExport(entryModule, exportName);
			const variable = traced.module.traceExport(traced.name);
			this.exports[exportName] = { module: traced.module, name: traced.name, variable };
			// if we exposed an export in another module ensure it is exported there
			if (traced.module.bundle !== this && !traced.module.isExternal) {
				(<Module>traced.module).bundle.ensureExport(traced.module, variable);
			}
			this.exportedVariables.set(variable, exportName);
		});
	}

	generateDependencies (entryFacade?: Module) {
		if (entryFacade) {
			this.externalModules = [];
			this.dependencies = [entryFacade.bundle];
			return;
		}

		this.externalModules = [];
		this.dependencies = [];

		this.orderedModules.forEach(module => {
			module.dependencies.forEach(dep => {
				if (dep.bundle === this) {
					return;
				}

				let depModule: Bundle | ExternalModule;
				if (dep instanceof Module) {
					depModule = dep.bundle;
				} else {
					// unused pure external modules can be skipped
					if (!dep.used && this.graph.isPureExternalModule(dep.id)) {
						return;
					}
					depModule = dep;
				}

				if (!this.dependencies.some(dep => dep === depModule)) {
					this.dependencies.push(depModule);
					if (dep.isExternal) {
						this.externalModules.push(dep);
					}
				}
			});
		});
	}

	generateImports () {
		this.orderedModules.forEach(module => {
			keys(module.imports).forEach(importName => {
				const declaration = module.imports[importName];

				const tracedExport = this.traceExport(declaration.module, declaration.name);

				// ignore imports to modules already in this bundle
				if (!tracedExport || tracedExport.module.bundle === this) {
					return;
				}

				const variable = tracedExport.module.traceExport(tracedExport.name);

				// namespace variable can indicate multiple imports
				if (tracedExport.name === '*') {
					keys((<NamespaceVariable>variable).originals || (<ExternalVariable>variable).module.declarations).forEach(importName => {
						const original = ((<NamespaceVariable>variable).originals || (<ExternalVariable>variable).module.declarations)[importName];
						if (!original.included) {
							return;
						}

						let exportName: string, importModule: Bundle | ExternalModule;

						// ensure that the variable is exported by the other bundle to this one
						if (tracedExport.module instanceof Module) {
							importModule = tracedExport.module.bundle;
							exportName = tracedExport.module.bundle.ensureExport(tracedExport.module, original);
						}
						else {
							importModule = tracedExport.module;
							exportName = original.name;
						}

						let impt = this.imports.find(impt => impt.module.id === importModule.id);
						if (!impt) {
							this.imports.push(impt = { module: importModule, variables: [] });
						}

						// if we already import this variable skip
						if (impt.variables.some(v => v.module === tracedExport.module && v.variable === original)) {
							return;
						}

						impt.variables.push({
							module: tracedExport.module,
							variable: original,
							name: exportName[0] === '*' ? '*' : exportName
						});
					});
					return;
				}

				// if the underlying variable is not included, skip it
				if (!variable.included) {
					return;
				}

				let exportName: string, importModule: Bundle | ExternalModule;

				// ensure that the variable is exported by the other bundle to this one
				if (tracedExport.module instanceof Module) {
					importModule = tracedExport.module.bundle;
					exportName = tracedExport.module.bundle.ensureExport(tracedExport.module, variable);
				}
				else {
					importModule = tracedExport.module;
					exportName = declaration.name;
				}

				let impt = this.imports.find(impt => impt.module.id === importModule.id);
				if (!impt) {
					this.imports.push(impt = { module: importModule, variables: [] });
				}

				// if we already import this variable skip
				if (impt.variables.some(v => v.module === tracedExport.module && v.variable === variable)) {
					return;
				}

				impt.variables.push({
					module: tracedExport.module,
					variable,
					name: exportName[0] === '*' ? '*' : exportName
				});
			});
		});
	}

	getImportIds (): string[] {
		return this.imports.map(impt => impt.module.id);
	}

	getExportNames (): string[] {
		return keys(this.exports);
	}

	getJsonModules (): ModuleJSON[] {
		return this.orderedModules.map(module => module.toJSON());
	}

	// trace a module export to its exposed bundle module export
	// either in this bundle or in another
	// we follow reexports if they are not entry points in the hope
	// that we can get an entry point reexport to reduce the chance of
	// tainting an entryModule bundle by exposing other unnecessary exports
	traceExport (module: Module | ExternalModule, name: string): { name: string, module: Module | ExternalModule } {
		if (name === '*') {
			return { name, module };
		}

		if (module instanceof ExternalModule) {
			return { name, module };
		}

		if (module.bundle !== this && module.isEntryPoint) {
			return { name, module };
		}

		if (module.exports[name]) {
			return { name, module };
		}

		const reexportDeclaration = module.reexports[name];
		if (reexportDeclaration) {
			return this.traceExport(reexportDeclaration.module, reexportDeclaration.localName);
		}

		if (name === 'default') {
			return;
		}

		for (let i = 0; i < module.exportAllModules.length; i += 1) {
			const exportAllModule = module.exportAllModules[i];
			// we have to ensure the right export all module
			if (name[0] === '*') {
				if (exportAllModule.id === name.substr(1)) {
					return this.traceExport(exportAllModule, '*');
				}
			}
			else if (exportAllModule.traceExport(name)) {
				return this.traceExport(exportAllModule, name);
			}
		}
	}

	collectAddon (initialAddon: string, addonName: 'banner' | 'footer' | 'intro' | 'outro', sep: string = '\n') {
		return runSequence(
			[{ pluginName: 'rollup', source: initialAddon } as { pluginName: string, source: string | (() => string) }]
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

	private setIdentifierRenderResolutions (options: OutputOptions) {
		const used = blank();

		let dynamicImportMechanism: DynamicImportMechanism;
		const es = options.format === 'es'

		if (!es) {
			if (options.format === 'cjs') {
				dynamicImportMechanism = {
					left: 'Promise.resolve(require(',
					right: '))'
				};
			} else if (options.format === 'amd') {
				dynamicImportMechanism = {
					left: 'new Promise(function (resolve, reject) { require([',
					right: '], resolve, reject) })'
				}
			}
		}

		if (this.graph.dynamicImport) {
			this.orderedModules.forEach(module => {
				module.dynamicImportResolutions.forEach((replacement, index) => {
					const node = module.dynamicImports[index];

					if (!replacement)
						return;

					if (replacement instanceof Module) {
						// if we have the module in the bundle, inline as Promise.resolve(namespace)
						// ensuring that we create a namespace import of it as well
						if (replacement.bundle === this) {
							node.setResolution(replacement.namespace(), { left: 'Promise.resolve().then(() => ', right: ')' });
						// for the module in another chunk, import that other chunk directly
						} else {
							node.setResolution(`"${replacement.bundle.id}"`, dynamicImportMechanism);
						}
					// external dynamic import resolution
					} else if (replacement instanceof ExternalModule) {
						node.setResolution(`"${replacement.id}"`, dynamicImportMechanism);
					// AST Node -> source replacement
					} else {
						node.setResolution(replacement, dynamicImportMechanism);
					}
				});
			});
		}

		// ensure no conflicts with globals
		keys(this.graph.scope.variables).forEach(name => (used[name] = 1));

		function getSafeName (name: string): string {
			let safeName = name;
			while (used[safeName]) {
				safeName = `${name}$${used[name]++}`;
			}
			used[safeName] = 1;
			return safeName;
		}

		const toDeshadow: Set<string> = new Set();

		this.externalModules.forEach(module => {
			if (!es || module.exportsNamespace) {
				const safeName = getSafeName(module.name);
				toDeshadow.add(safeName);
				module.name = safeName;
			}
		});

		this.imports.forEach(impt => {
			impt.variables.forEach(({ name, module, variable }) => {
				let safeName;
				if (module.isExternal) {
					if (variable.name === '*') {
						safeName = module.name;
					} else if (variable.name === 'default') {
						if (module.exportsNamespace || !es && module.exportsNames) {
							safeName = `${module.name}__default`;
						} else {
							safeName = module.name;
						}
					} else {
						safeName = es ? getSafeName(variable.name) : `${module.name}.${name}`;
					}
				} else if (es) {
					safeName = getSafeName(variable.name);
				} else {
					safeName = `${(<Module>module).bundle.name}.${name}`;
				}
				variable.setSafeName(safeName);
			});
		});

		this.orderedModules.forEach(module => {
			forOwn(module.scope.variables, variable => {
				if (!(<ExportDefaultVariable>variable).isDefault || !(<ExportDefaultVariable>variable).hasId) {
					let safeName;
					if (es || !variable.isReassigned) {
						safeName = getSafeName(variable.name);
					} else {
						const safeExportName = this.exportedVariables.get(variable);
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

	getModuleDeclarations () {
		const reexportDeclarations: {
			[id: string]: ReexportSpecifier[]
		} = {};

		for (let name in this.exports) {
			const expt = this.exports[name];
			// skip local exports
			if (expt.module.bundle === this)
				continue;
			let depId;
			if (expt.module.isExternal) {
				depId = expt.module.id;
			} else {
				depId = (<Bundle>expt.module.bundle).id;
			}
			const exportDeclaration = reexportDeclarations[depId] = reexportDeclarations[depId] || [];
			exportDeclaration.push({
				imported: expt.name,
				reexported: name
			});
		}

		const dependencies: BundleDependencies = [];

		let imports: ImportSpecifier[];
		this.dependencies.forEach(dep => {
			const importSpecifiers = this.imports.find(impt => impt.module === dep);

			if (importSpecifiers && importSpecifiers.variables.length) {
				imports = [];
				for (let i = 0; i < importSpecifiers.variables.length; i++) {
					const impt = importSpecifiers.variables[i];
					imports.push({
						local: impt.variable.getName(),
						imported: impt.name
					});
				}
			}

			let reexports = reexportDeclarations[dep.id];
			dependencies.push({
				id: dep.id,
				name: dep.name,
				isBundle: !(<ExternalModule>dep).isExternal,
				reexports,
				imports
			});
		});

		const exports: BundleExports = [];
		for (let name in this.exports) {
			const expt = this.exports[name];
			// skip external exports
			if (expt.module.bundle !== this)
				continue;
			exports.push({
				local: expt.variable.getName(),
				exported: name
			});
		}

		return { dependencies, exports };
	}

	render (options: OutputOptions) {
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
				const exportMode = getExportMode(this, options);

				let magicString = new MagicStringBundle({ separator: '\n\n' });
				const usedModules: Module[] = [];

				timeStart('render modules');

				this.setIdentifierRenderResolutions(options);

				this.orderedModules.forEach(module => {
					const source = module.render(this.graph.legacy, options.freeze !== false);

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
						message: `Invalid format: ${
							options.format
							} - valid options are ${keys(finalisers).join(', ')}`
					});
				}

				timeStart('render format');

				const optionsPaths = options.paths;
				const getPath =
					typeof optionsPaths === 'function'
						? (id: string) => optionsPaths(id, this.id) || this.graph.getPathRelativeToBaseDirname(id, this.id)
						: optionsPaths
							? (id: string) =>
								optionsPaths.hasOwnProperty(id)
									? optionsPaths[id]
									: this.graph.getPathRelativeToBaseDirname(id, this.id)
							: (id: string) => this.graph.getPathRelativeToBaseDirname(id, this.id);

				if (intro) intro += '\n\n';
				if (outro) outro = `\n\n${outro}`;

				magicString = finalise(
					this,
					(<any>magicString).trim(), // TODO TypeScript: Awaiting MagicString PR
					{ exportMode, getPath, indentString, intro, outro },
					options
				);

				timeEnd('render format');

				if (banner) magicString.prepend(banner + '\n');
				if (footer) (<any>magicString).append('\n' + footer); // TODO TypeScript: Awaiting MagicString PR

				const prevCode = magicString.toString();
				let map: RawSourceMap = null;
				const bundleSourcemapChain: RawSourceMap[] = [];

				return transformBundle(
					prevCode,
					this.graph.plugins,
					bundleSourcemapChain,
					options
				).then((code: string) => {
					if (options.sourcemap) {
						timeStart('sourcemap');

						let file = options.sourcemapFile || options.file;
						if (file)
							file = resolve(
								typeof process !== 'undefined' ? process.cwd() : '',
								file
							);

						if (
							this.graph.hasLoaders ||
							find(
								this.graph.plugins,
								plugin => Boolean(plugin.transform || plugin.transformBundle)
							)
						) {
							map = <any>magicString.generateMap({}); // TODO TypeScript: Awaiting missing version in SourceMap type
							if (typeof map.mappings === 'string') {
								map.mappings = decode(map.mappings);
							}
							map = collapseSourcemaps(
								this,
								file,
								map,
								usedModules,
								bundleSourcemapChain
							);
						} else {
							map = <any>magicString.generateMap({ file, includeContent: true }); // TODO TypeScript: Awaiting missing version in SourceMap type
						}

						map.sources = map.sources.map(normalize);

						timeEnd('sourcemap');
					}

					if (code[code.length - 1] !== '\n') code += '\n';
					return { code, map } as { code: string, map: any }; // TODO TypeScript: Awaiting missing version in SourceMap type
				});
			});
	}
}
