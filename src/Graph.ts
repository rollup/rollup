import * as acorn from 'acorn';
import injectDynamicImportPlugin from 'acorn-dynamic-import/lib/inject';
import injectImportMeta from 'acorn-import-meta/inject';
import { Program } from 'estree';
import GlobalScope from './ast/scopes/GlobalScope';
import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import Module, { defaultAcornOptions } from './Module';
import {
	InputOptions,
	IsExternal,
	LoadHook,
	MissingExportHook,
	ModuleJSON,
	OutputBundle,
	Plugin,
	PluginContext,
	ResolveDynamicImportHook,
	ResolveIdHook,
	RollupError,
	RollupWarning,
	SourceDescription,
	TreeshakingOptions,
	WarningHandler
} from './rollup/types';
import { Asset, createAssetPluginHooks, finaliseAsset } from './utils/assetHooks';
import { handleMissingExport, load, makeOnwarn, resolveId } from './utils/defaults';
import ensureArray from './utils/ensureArray';
import { randomUint8Array, Uint8ArrayToHexString, Uint8ArrayXor } from './utils/entryHashing';
import error from './utils/error';
import first from './utils/first';
import firstSync from './utils/first-sync';
import { isRelative, relative, resolve } from './utils/path';
import relativeId, { getAliasName } from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

export default class Graph {
	curChunkIndex = 0;
	acornOptions: acorn.Options;
	acornParse: acorn.IParse;
	cachedModules: Map<string, ModuleJSON>;
	context: string;
	externalModules: ExternalModule[] = [];
	getModuleContext: (id: string) => string;
	hasLoaders: boolean;
	isExternal: IsExternal;
	isPureExternalModule: (id: string) => boolean;
	load: LoadHook;
	handleMissingExport: MissingExportHook;
	moduleById = new Map<string, Module | ExternalModule>();
	assetsById = new Map<string, Asset>();
	modules: Module[] = [];
	onwarn: WarningHandler;
	plugins: Plugin[];
	pluginContext: PluginContext;
	resolveDynamicImport: ResolveDynamicImportHook;
	resolveId: (id: string, parent: string) => Promise<string | boolean | void>;
	scope: GlobalScope;
	treeshakingOptions: TreeshakingOptions;
	varOrConst: 'var' | 'const';

	contextParse: (code: string, acornOptions?: acorn.Options) => Program;

	// deprecated
	treeshake: boolean;

	constructor(options: InputOptions) {
		this.curChunkIndex = 0;
		this.cachedModules = new Map();
		if (options.cache) {
			if (options.cache.modules) {
				options.cache.modules.forEach(module => {
					this.cachedModules.set(module.id, module);
				});
			}
		}
		delete options.cache; // TODO not deleting it here causes a memory leak; needs further investigation

		this.plugins = options.plugins;

		if (!options.input) {
			throw new Error('You must supply options.input to rollup');
		}

		this.treeshake = options.treeshake !== false;
		if (this.treeshake) {
			this.treeshakingOptions = {
				propertyReadSideEffects: options.treeshake
					? (<TreeshakingOptions>options.treeshake).propertyReadSideEffects !== false
					: true,
				pureExternalModules: options.treeshake
					? (<TreeshakingOptions>options.treeshake).pureExternalModules
					: false
			};
			if (this.treeshakingOptions.pureExternalModules === true) {
				this.isPureExternalModule = () => true;
			} else if (typeof this.treeshakingOptions.pureExternalModules === 'function') {
				this.isPureExternalModule = this.treeshakingOptions.pureExternalModules;
			} else if (Array.isArray(this.treeshakingOptions.pureExternalModules)) {
				const pureExternalModules = new Set(this.treeshakingOptions.pureExternalModules);
				this.isPureExternalModule = id => pureExternalModules.has(id);
			} else {
				this.isPureExternalModule = () => false;
			}
		} else {
			this.isPureExternalModule = () => false;
		}

		this.contextParse = (code: string, options: acorn.Options = {}) => {
			return this.acornParse(
				code,
				Object.assign({}, defaultAcornOptions, options, this.acornOptions)
			);
		};

		this.pluginContext = Object.assign(
			{
				isExternal: undefined,
				resolveId: undefined,
				parse: this.contextParse,
				warn: (warning: RollupWarning | string) => {
					if (typeof warning === 'string') warning = { message: warning };
					this.warn(warning);
				},
				error: (err: RollupError | string) => {
					if (typeof err === 'string') throw new Error(err);
					error(err);
				}
			},
			createAssetPluginHooks(this.assetsById)
		);

		this.resolveId = first(
			[
				((id: string, parentId: string) =>
					this.isExternal(id, parentId, false) ? false : null) as ResolveIdHook
			]
				.concat(
					this.plugins
						.map(plugin => plugin.resolveId)
						.filter(Boolean)
						.map(resolveId => resolveId.bind(this.pluginContext))
				)
				.concat(resolveId(options))
		);

		this.pluginContext.resolveId = this.resolveId;

		const loaders = this.plugins.map(plugin => plugin.load).filter(Boolean);
		this.hasLoaders = loaders.length !== 0;

		this.load = first([...loaders, load]);

		this.handleMissingExport = firstSync(
			this.plugins
				.map(plugin => plugin.missingExport)
				.filter(Boolean)
				.map(missingExport => {
					return (
						exportName: string,
						importingModule: Module,
						importedModule: string,
						importerStart?: number
					) => {
						return missingExport.call(
							this.pluginContext,
							importingModule.id,
							exportName,
							importedModule,
							importerStart
						);
					};
				})
				.concat(handleMissingExport)
		);

		this.scope = new GlobalScope();

		// TODO strictly speaking, this only applies with non-ES6, non-default-only bundles
		for (const name of ['module', 'exports', '_interopDefault']) {
			this.scope.findVariable(name); // creates global variable as side-effect
		}

		this.context = String(options.context);

		const optionsModuleContext = options.moduleContext;
		if (typeof optionsModuleContext === 'function') {
			this.getModuleContext = id => optionsModuleContext(id) || this.context;
		} else if (typeof optionsModuleContext === 'object') {
			const moduleContext = new Map();
			for (const key in optionsModuleContext) {
				moduleContext.set(resolve(key), optionsModuleContext[key]);
			}
			this.getModuleContext = id => moduleContext.get(id) || this.context;
		} else {
			this.getModuleContext = () => this.context;
		}

		if (typeof options.external === 'function') {
			this.isExternal = options.external;
		} else {
			const ids = ensureArray(options.external);
			this.isExternal = id => ids.indexOf(id) !== -1;
		}
		this.pluginContext.isExternal = this.isExternal;

		this.onwarn = options.onwarn || makeOnwarn();

		this.varOrConst = options.preferConst ? 'const' : 'var';

		this.acornOptions = options.acorn || {};
		const acornPluginsToInject = [];

		this.resolveDynamicImport = first(
			[
				...this.plugins.map(plugin => plugin.resolveDynamicImport).filter(Boolean),
				<ResolveDynamicImportHook>function(specifier, parentId) {
					return typeof specifier === 'string' && this.resolveId(specifier, parentId);
				}
			].map(resolveDynamicImport => resolveDynamicImport.bind(this.pluginContext))
		);
		acornPluginsToInject.push(injectDynamicImportPlugin);
		acornPluginsToInject.push(injectImportMeta);
		this.acornOptions.plugins = this.acornOptions.plugins || {};
		this.acornOptions.plugins.dynamicImport = true;
		this.acornOptions.plugins.importMeta = true;

		acornPluginsToInject.push(...ensureArray(options.acornInjectPlugins));
		this.acornParse = acornPluginsToInject.reduce((acc, plugin) => plugin(acc), acorn).parse;
	}

	getCache() {
		return {
			modules: this.modules.map(module => module.toJSON())
		};
	}

	finaliseAssets(assetFileNames: string) {
		const outputBundle: OutputBundle = Object.create(null);
		this.assetsById.forEach(asset => {
			if (asset.source !== undefined) finaliseAsset(asset, outputBundle, assetFileNames);
		});
		return outputBundle;
	}

	private loadModule(entryName: string) {
		return this.resolveId(entryName, undefined).then(id => {
			if (id === false) {
				error({
					code: 'UNRESOLVED_ENTRY',
					message: `Entry module cannot be external`
				});
			}

			if (id == null) {
				error({
					code: 'UNRESOLVED_ENTRY',
					message: `Could not resolve entry (${entryName})`
				});
			}

			return this.fetchModule(<string>id, undefined);
		});
	}

	private link() {
		for (const module of this.modules) {
			module.linkDependencies();
		}
		for (const module of this.modules) {
			module.bindReferences();
		}
	}

	includeMarked(modules: Module[]) {
		if (this.treeshake) {
			let needsTreeshakingPass,
				treeshakingPass = 1;
			do {
				timeStart(`treeshaking pass ${treeshakingPass}`, 3);
				needsTreeshakingPass = false;
				for (const module of modules) {
					if (module.include()) {
						needsTreeshakingPass = true;
					}
				}
				timeEnd(`treeshaking pass ${treeshakingPass++}`, 3);
			} while (needsTreeshakingPass);
		} else {
			// Necessary to properly replace namespace imports
			for (const module of modules) module.includeAllInBundle();
		}
	}

	private loadEntryModules(
		entryModules: string | string[] | Record<string, string>,
		manualChunks: Record<string, string[]> | void
	) {
		let removeAliasExtensions = false;
		let entryModuleIds: string[];
		let entryModuleAliases: string[];
		if (typeof entryModules === 'string') entryModules = [entryModules];

		if (Array.isArray(entryModules)) {
			removeAliasExtensions = true;
			entryModuleAliases = entryModules.concat([]);
			entryModuleIds = entryModules;
		} else {
			entryModuleAliases = Object.keys(entryModules);
			entryModuleIds = entryModuleAliases.map(name => (<Record<string, string>>entryModules)[name]);
		}

		const entryAndManualChunkIds = entryModuleIds.concat([]);
		if (manualChunks) {
			Object.keys(manualChunks).forEach(name => {
				const manualChunkIds = manualChunks[name];
				manualChunkIds.forEach(id => {
					if (entryAndManualChunkIds.indexOf(id) === -1) entryAndManualChunkIds.push(id);
				});
			});
		}

		return Promise.all(entryAndManualChunkIds.map(id => this.loadModule(id))).then(
			entryAndChunkModules => {
				if (removeAliasExtensions) {
					for (let i = 0; i < entryModuleAliases.length; i++)
						entryModuleAliases[i] = getAliasName(entryAndChunkModules[i].id, entryModuleAliases[i]);
				}

				const entryModules = entryAndChunkModules.slice(0, entryModuleIds.length);

				let manualChunkModules: { [chunkName: string]: Module[] };
				if (manualChunks) {
					manualChunkModules = {};
					for (const chunkName of Object.keys(manualChunks)) {
						const chunk = manualChunks[chunkName];
						manualChunkModules[chunkName] = chunk.map(entryId => {
							const entryIndex = entryAndManualChunkIds.indexOf(entryId);
							return entryAndChunkModules[entryIndex];
						});
					}
				}

				return { entryModules, entryModuleAliases, manualChunkModules };
			}
		);
	}

	build(
		entryModules: string | string[] | Record<string, string>,
		manualChunks: Record<string, string[]> | void,
		inlineDynamicImports: boolean,
		preserveModules: boolean
	): Promise<Chunk[]> {
		// Phase 1 – discovery. We load the entry module and find which
		// modules it imports, and import those, until we have all
		// of the entry module's dependencies

		timeStart('parse modules', 2);

		return this.loadEntryModules(entryModules, manualChunks).then(
			({ entryModules, entryModuleAliases, manualChunkModules }) => {
				timeEnd('parse modules', 2);

				// Phase 2 - linking. We populate the module dependency links and
				// determine the topological execution order for the bundle
				timeStart('analyse dependency graph', 2);

				for (let i = 0; i < entryModules.length; i++) {
					const entryModule = entryModules[i];
					const duplicateIndex = entryModules.indexOf(entryModule, i + 1);
					if (duplicateIndex !== -1) {
						error({
							code: 'DUPLICATE_ENTRY_POINTS',
							message: `Duplicate entry points detected. The input entries ${
								entryModuleAliases[i]
							} and ${entryModuleAliases[duplicateIndex]} both point to the same module, ${
								entryModule.id
							}`
						});
					}
				}

				this.link();

				const { orderedModules, dynamicImports, dynamicImportAliases } = this.analyseExecution(
					entryModules,
					!preserveModules && !inlineDynamicImports,
					inlineDynamicImports,
					manualChunkModules
				);

				if (entryModuleAliases) {
					for (let i = entryModules.length - 1; i >= 0; i--) {
						entryModules[i].chunkAlias = entryModuleAliases[i];
					}
				}

				if (inlineDynamicImports) {
					const entryModule = entryModules[0];
					if (entryModules.length > 1)
						throw new Error(
							'Internal Error: can only inline dynamic imports for single-file builds.'
						);
					for (const dynamicImportModule of dynamicImports) {
						if (entryModule !== dynamicImportModule) dynamicImportModule.markPublicExports();
						dynamicImportModule.getOrCreateNamespace().include();
					}
				} else {
					for (let i = 0; i < dynamicImports.length; i++) {
						const dynamicImportModule = dynamicImports[i];
						if (entryModules.indexOf(dynamicImportModule) === -1) {
							entryModules.push(dynamicImportModule);
							if (!dynamicImportModule.chunkAlias)
								dynamicImportModule.chunkAlias = dynamicImportAliases[i];
						}
					}
				}

				timeEnd('analyse dependency graph', 2);

				// Phase 3 – marking. We include all statements that should be included
				timeStart('mark included statements', 2);

				for (const entryModule of entryModules) entryModule.markPublicExports();

				// only include statements that should appear in the bundle
				this.includeMarked(orderedModules);

				// check for unused external imports
				for (const externalModule of this.externalModules) externalModule.warnUnusedImports();

				timeEnd('mark included statements', 2);

				// Phase 4 – we construct the chunks, working out the optimal chunking using
				// entry point graph colouring, before generating the import and export facades
				timeStart('generate chunks', 2);

				// TODO: there is one special edge case unhandled here and that is that any module
				//       exposed as an unresolvable export * (to a graph external export *,
				//       either as a namespace import reexported or top-level export *)
				//       should be made to be its own entry point module before chunking
				const chunkList: Chunk[] = [];
				if (!preserveModules) {
					const chunkModules: { [entryHashSum: string]: Module[] } = {};
					for (const module of orderedModules) {
						const entryPointsHashStr = Uint8ArrayToHexString(module.entryPointsHash);
						const curChunk = chunkModules[entryPointsHashStr];
						if (curChunk) {
							curChunk.push(module);
						} else {
							chunkModules[entryPointsHashStr] = [module];
						}
					}

					// create each chunk
					for (const entryHashSum in chunkModules) {
						const chunkModuleList = chunkModules[entryHashSum];
						const chunkModulesOrdered = chunkModuleList.sort(
							(moduleA, moduleB) => (moduleA.execIndex > moduleB.execIndex ? 1 : -1)
						);
						const chunk = new Chunk(this, chunkModulesOrdered);
						chunkList.push(chunk);
					}
				} else {
					for (const module of orderedModules) {
						const chunkInstance = new Chunk(this, [module]);
						if (module.isEntryPoint || !chunkInstance.isEmpty) chunkInstance.entryModule = module;
						chunkList.push(chunkInstance);
					}
				}

				// for each chunk module, set up its imports to other
				// chunks, if those variables are included after treeshaking
				for (const chunk of chunkList) {
					chunk.link();
				}

				// filter out empty dependencies
				for (let i = 0; i < chunkList.length; i++) {
					const chunk = chunkList[i];
					if (chunk.isEmpty && !chunk.entryModule) {
						chunkList.splice(i--, 1);
					}
				}

				// then go over and ensure all entry chunks export their variables
				for (const chunk of chunkList) {
					if (preserveModules || chunk.entryModule) {
						chunk.populateEntryExports(preserveModules);
					}
				}

				// create entry point facades for entry module chunks that have tainted exports
				if (!preserveModules) {
					for (const entryModule of entryModules) {
						if (!entryModule.chunk.isEntryModuleFacade) {
							const entryPointFacade = new Chunk(this, []);
							entryPointFacade.linkFacade(entryModule);
							chunkList.push(entryPointFacade);
						}
					}
				}

				timeEnd('generate chunks', 2);

				return chunkList;
			}
		);
	}

	private analyseExecution(
		entryModules: Module[],
		graphColouring: boolean,
		inlineDynamicImports: boolean,
		chunkModules?: Record<string, Module[]>
	) {
		let curEntry: Module, curEntryHash: Uint8Array;
		const allSeen: { [id: string]: boolean } = {};

		const orderedModules: Module[] = [];

		const dynamicImports: Module[] = [];
		const dynamicImportAliases: string[] = [];

		let parents: { [id: string]: string };

		const visit = (module: Module) => {
			// Track entry point graph colouring by tracing all modules loaded by a given
			// entry point and colouring those modules by the hash of its id. Colours are mixed as
			// hash xors, providing the unique colouring of the graph into unique hash chunks.
			// This is really all there is to automated chunking, the rest is chunk wiring.
			if (graphColouring) {
				if (!curEntry.chunkAlias) {
					Uint8ArrayXor(module.entryPointsHash, curEntryHash);
				} else {
					// manual chunks are indicated in this phase by having a chunk alias
					// they are treated as a single colour in the colouring
					// and aren't divisable by future colourings
					module.chunkAlias = curEntry.chunkAlias;
					module.entryPointsHash = curEntryHash;
				}
			}

			for (const depModule of module.dependencies) {
				if (depModule instanceof ExternalModule) continue;

				if (depModule.id in parents) {
					if (!allSeen[depModule.id]) {
						this.warnCycle(depModule.id, module.id, parents);
					}
					continue;
				}

				parents[depModule.id] = module.id;
				if (!depModule.isEntryPoint && !depModule.chunkAlias) visit(depModule);
			}

			for (const dynamicModule of module.dynamicImportResolutions) {
				if (dynamicModule.resolution instanceof Module) {
					if (dynamicImports.indexOf(dynamicModule.resolution) === -1) {
						dynamicImports.push(dynamicModule.resolution);
						dynamicImportAliases.push(dynamicModule.alias);
					}
				}
			}

			if (allSeen[module.id]) return;
			allSeen[module.id] = true;

			module.execIndex = orderedModules.length;
			orderedModules.push(module);
		};

		if (graphColouring && chunkModules) {
			for (const chunkName of Object.keys(chunkModules)) {
				curEntryHash = randomUint8Array(10);

				for (curEntry of chunkModules[chunkName]) {
					if (curEntry.chunkAlias) {
						error({
							code: 'INVALID_CHUNK',
							message: `Cannot assign ${relative(
								process.cwd(),
								curEntry.id
							)} to the "${chunkName}" chunk as it is already in the "${curEntry.chunkAlias}" chunk.
Try defining "${chunkName}" first in the manualChunks definitions of the Rollup configuration.`
						});
					}
					curEntry.chunkAlias = chunkName;
					parents = { [curEntry.id]: null };
					visit(curEntry);
				}
			}
		}

		for (curEntry of entryModules) {
			curEntry.isEntryPoint = true;
			curEntryHash = randomUint8Array(10);
			parents = { [curEntry.id]: null };
			visit(curEntry);
		}

		// new items can be added during this loop
		for (curEntry of dynamicImports) {
			if (curEntry.isEntryPoint) continue;
			if (!inlineDynamicImports) curEntry.isEntryPoint = true;
			curEntryHash = randomUint8Array(10);
			parents = { [curEntry.id]: null };
			visit(curEntry);
		}

		return { orderedModules, dynamicImports, dynamicImportAliases };
	}

	private warnCycle(id: string, parentId: string, parents: { [id: string]: string | null }) {
		const path = [relativeId(id)];
		let curId = parentId;
		while (curId !== id) {
			path.push(relativeId(curId));
			curId = parents[curId];
			if (!curId) break;
		}
		path.push(path[0]);
		path.reverse();
		this.warn({
			code: 'CIRCULAR_DEPENDENCY',
			importer: path[0],
			message: `Circular dependency: ${path.join(' -> ')}`
		});
	}

	private fetchModule(id: string, importer: string): Promise<Module> {
		// short-circuit cycles
		const existingModule = this.moduleById.get(id);
		if (existingModule) {
			if (existingModule.isExternal) throw new Error(`Cannot fetch external module ${id}`);
			return Promise.resolve(<Module>existingModule);
		}

		const module: Module = new Module(this, id);
		this.moduleById.set(id, module);

		timeStart('load modules', 3);
		return Promise.resolve(this.load.call(this.pluginContext, id))
			.catch((err: Error) => {
				timeEnd('load modules', 3);
				let msg = `Could not load ${id}`;
				if (importer) msg += ` (imported by ${importer})`;

				msg += `: ${err.message}`;
				throw new Error(msg);
			})
			.then(source => {
				timeEnd('load modules', 3);
				if (typeof source === 'string') return source;
				if (source && typeof source === 'object' && typeof source.code === 'string') return source;

				// TODO report which plugin failed
				error({
					code: 'BAD_LOADER',
					message: `Error loading ${relativeId(
						id
					)}: plugin load hook should return a string, a { code, map } object, or nothing/null`
				});
			})
			.then(source => {
				const sourceDescription: SourceDescription =
					typeof source === 'string'
						? {
								code: source,
								ast: null
						  }
						: source;

				if (
					this.cachedModules.has(id) &&
					this.cachedModules.get(id).originalCode === sourceDescription.code
				) {
					return this.cachedModules.get(id);
				}

				return transform(this, sourceDescription, id, this.plugins);
			})
			.then((source: ModuleJSON) => {
				module.setSource(source);

				this.modules.push(module);
				this.moduleById.set(id, module);

				return this.fetchAllDependencies(module).then(() => {
					for (const name in module.exports) {
						if (name !== 'default') {
							module.exportsAll[name] = module.id;
						}
					}
					module.exportAllSources.forEach(source => {
						const id = module.resolvedIds[source];
						const exportAllModule = this.moduleById.get(id);
						if (exportAllModule.isExternal) return;

						for (const name in (<Module>exportAllModule).exportsAll) {
							if (name in module.exportsAll) {
								this.warn({
									code: 'NAMESPACE_CONFLICT',
									reexporter: module.id,
									name,
									sources: [module.exportsAll[name], (<Module>exportAllModule).exportsAll[name]],
									message: `Conflicting namespaces: ${relativeId(
										module.id
									)} re-exports '${name}' from both ${relativeId(
										module.exportsAll[name]
									)} and ${relativeId(
										(<Module>exportAllModule).exportsAll[name]
									)} (will be ignored)`
								});
							} else {
								module.exportsAll[name] = (<Module>exportAllModule).exportsAll[name];
							}
						}
					});
					return module;
				});
			});
	}

	private fetchAllDependencies(module: Module) {
		// resolve and fetch dynamic imports where possible
		const fetchDynamicImportsPromise = Promise.all(
			module.getDynamicImportExpressions().map((dynamicImportExpression, index) => {
				return Promise.resolve(
					this.resolveDynamicImport.call(this.pluginContext, dynamicImportExpression, module.id)
				).then(replacement => {
					if (!replacement) {
						module.dynamicImportResolutions[index] = {
							alias: undefined,
							resolution: undefined
						};
						return;
					}
					const alias = getAliasName(
						replacement,
						typeof dynamicImportExpression === 'string' ? dynamicImportExpression : undefined
					);
					if (typeof dynamicImportExpression !== 'string') {
						module.dynamicImportResolutions[index] = { alias, resolution: replacement };
					} else if (this.isExternal(replacement, module.id, true)) {
						let externalModule;
						if (!this.moduleById.has(replacement)) {
							externalModule = new ExternalModule({
								graph: this,
								id: replacement
							});
							this.externalModules.push(externalModule);
							this.moduleById.set(replacement, module);
						} else {
							externalModule = <ExternalModule>this.moduleById.get(replacement);
						}
						module.dynamicImportResolutions[index] = { alias, resolution: externalModule };
						externalModule.exportsNamespace = true;
					} else {
						return this.fetchModule(replacement, module.id).then(depModule => {
							module.dynamicImportResolutions[index] = { alias, resolution: depModule };
						});
					}
				});
			})
		).then(() => {});
		fetchDynamicImportsPromise.catch(() => {});

		return Promise.all(
			module.sources.map(source => {
				const resolvedId = module.resolvedIds[source];
				return (resolvedId ? Promise.resolve(resolvedId) : this.resolveId(source, module.id)).then(
					resolvedId => {
						// TODO types of `resolvedId` are not compatable with 'externalId'.
						// `this.resolveId` returns `string`, `void`, and `boolean`
						const externalId =
							<string>resolvedId ||
							(isRelative(source) ? resolve(module.id, '..', source) : source);
						let isExternal = this.isExternal.call(this.pluginContext, externalId, module.id, true);

						if (!resolvedId && !isExternal) {
							if (isRelative(source)) {
								error({
									code: 'UNRESOLVED_IMPORT',
									message: `Could not resolve '${source}' from ${relativeId(module.id)}`
								});
							}

							if (resolvedId !== false) {
								this.warn({
									code: 'UNRESOLVED_IMPORT',
									source,
									importer: relativeId(module.id),
									message: `'${source}' is imported by ${relativeId(
										module.id
									)}, but could not be resolved – treating it as an external dependency`,
									url:
										'https://github.com/rollup/rollup/wiki/Troubleshooting#treating-module-as-external-dependency'
								});
							}
							isExternal = true;
						}

						if (isExternal) {
							module.resolvedIds[source] = externalId;

							if (!this.moduleById.has(externalId)) {
								const module = new ExternalModule({ graph: this, id: externalId });
								this.externalModules.push(module);
								this.moduleById.set(externalId, module);
							}

							const externalModule = this.moduleById.get(externalId);

							// add external declarations so we can detect which are never used
							for (const name in module.imports) {
								const importDeclaration = module.imports[name];
								if (importDeclaration.source !== source) return;

								externalModule.traceExport(importDeclaration.name);
							}
						} else {
							module.resolvedIds[source] = <string>resolvedId;
							return this.fetchModule(<string>resolvedId, module.id);
						}
					}
				);
			})
		).then(() => fetchDynamicImportsPromise);
	}

	warn(warning: RollupWarning) {
		warning.toString = () => {
			let str = '';

			if (warning.plugin) str += `(${warning.plugin} plugin) `;
			if (warning.loc)
				str += `${relativeId(warning.loc.file)} (${warning.loc.line}:${warning.loc.column}) `;
			str += warning.message;

			return str;
		};

		this.onwarn(warning);
	}
}
