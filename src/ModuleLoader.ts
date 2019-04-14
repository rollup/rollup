import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import { ModuleJSON, ResolvedId, ResolveIdResult, SourceDescription } from './rollup/types';
import { error } from './utils/error';
import { addWithNewMetaId } from './utils/metaIds';
import { isRelative, resolve } from './utils/path';
import { PluginDriver } from './utils/pluginDriver';
import relativeId, { getAliasName } from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

interface ModuleWithAlias {
	alias: string | null;
	module: Module;
}

export interface UnresolvedModuleWithAlias {
	alias: string | null;
	unresolvedId: string;
}

function normalizeRelativeExternalId(importee: string, source: string) {
	return isRelative(source) ? resolve(importee, '..', source) : source;
}

// TODO Lukas this.addEntry -> addEntryChunk
export class ModuleLoader {
	private readonly entriesByMetaId = new Map<string, { module: Module | null }>();
	private readonly entryModulesWithAliases: ModuleWithAlias[] = [];
	private readonly graph: Graph;
	private latestLoadModulesPromise: Promise<any> = Promise.resolve();
	private readonly manualChunkModules: Record<string, Module[]> = {};
	private readonly modulesById: Map<string, Module | ExternalModule>;
	private readonly pluginDriver: PluginDriver;

	// TODO Lukas get rid of graph dependency
	constructor(
		graph: Graph,
		modulesById: Map<string, Module | ExternalModule>,
		pluginDriver: PluginDriver
	) {
		this.graph = graph;
		this.modulesById = modulesById;
		this.pluginDriver = pluginDriver;
	}

	addEntryModuleAndGetMetaId(unresolvedEntryModule: UnresolvedModuleWithAlias): string {
		const entryRecord: { module: Module | null } = { module: null };
		const metaId = addWithNewMetaId(
			entryRecord,
			this.entriesByMetaId,
			unresolvedEntryModule.unresolvedId
		);
		this.addEntryModules([unresolvedEntryModule]).then(({ newEntryModules: [{ module }] }) => {
			entryRecord.module = module;
		});
		return metaId;
	}

	// TODO Lukas fail if finished
	addEntryModules(
		unresolvedEntryModules: UnresolvedModuleWithAlias[]
	): Promise<{
		entryModulesWithAliases: ModuleWithAlias[];
		manualChunkModulesByAlias: Record<string, Module[]>;
		newEntryModules: ModuleWithAlias[];
	}> {
		const loadNewEntryModulesPromise = Promise.all(
			unresolvedEntryModules.map(this.loadEntryModule)
		).then(entryModulesWithAliases => {
			for (const entryModuleWithAlias of entryModulesWithAliases) {
				const existingEntryModuleWithAlias = this.entryModulesWithAliases.find(
					({ module: { id } }) => id === entryModuleWithAlias.module.id
				);
				if (existingEntryModuleWithAlias) {
					// TODO Lukas: Do not assign aliases here
					// TODO Lukas: Introduce separate manual chunk alias variable
					if (entryModuleWithAlias.alias) {
						if (!existingEntryModuleWithAlias.alias) {
							existingEntryModuleWithAlias.alias = entryModuleWithAlias.alias;
						} else if (existingEntryModuleWithAlias.alias !== entryModuleWithAlias.alias) {
							// TODO Lukas can this even happen?
							error({
								code: 'DUPLICATE_ENTRY_POINTS',
								message: `Duplicate entry points with different aliases detected. The input entries ${
									existingEntryModuleWithAlias.alias
								} and ${entryModuleWithAlias.alias} both point to the same module, ${
									entryModuleWithAlias.module.id
								}`
							});
						}
					}
				} else {
					this.entryModulesWithAliases.push(entryModuleWithAlias);
				}
			}
			return entryModulesWithAliases;
		});
		return this.awaitLoadModulesPromise(loadNewEntryModulesPromise).then(newEntryModules => ({
			entryModulesWithAliases: this.entryModulesWithAliases,
			manualChunkModulesByAlias: this.manualChunkModules,
			newEntryModules
		}));
	}

	addManualChunks(manualChunks: Record<string, string[]>): Promise<void> {
		const unresolvedManualChunks: UnresolvedModuleWithAlias[] = [];
		for (const alias of Object.keys(manualChunks)) {
			const manualChunkIds = manualChunks[alias];
			for (const unresolvedId of manualChunkIds) {
				unresolvedManualChunks.push({ alias, unresolvedId });
			}
		}
		const loadNewManualChunkModulesPromise = Promise.all(
			unresolvedManualChunks.map(this.loadEntryModule)
		).then(manualChunkModules => {
			for (const { alias, module } of manualChunkModules) {
				if (!this.manualChunkModules[alias]) {
					this.manualChunkModules[alias] = [];
				}
				this.manualChunkModules[alias].push(module);
			}
		});

		return this.awaitLoadModulesPromise(loadNewManualChunkModulesPromise);
	}

	getChunkFileName(metaId: string): string {
		const entryRecord = this.entriesByMetaId.get(metaId);
		if (!entryRecord)
			error({
				code: 'CHUNK_NOT_FOUND',
				message: `Plugin error - Unable to get chunk filename for unknown chunk ${metaId}.`
			});
		// TODO Lukas check correct file name
		if (entryRecord.module === null)
			error({
				code: 'XXX',
				message: `Plugin error - Unable to get chunk file name for chunk ${metaId}. Ensure that generate is called first.`
			});
		// TODO Lukas facadeChunk?
		return entryRecord.module.chunk.id;
	}

	private awaitLoadModulesPromise<T>(loadNewModulesPromise: Promise<T>): Promise<T> {
		this.latestLoadModulesPromise = Promise.all([
			loadNewModulesPromise,
			this.latestLoadModulesPromise
		]);

		const getCombinedPromise = (): Promise<never> => {
			const startingPromise = this.latestLoadModulesPromise;
			return startingPromise.then(() => {
				if (this.latestLoadModulesPromise !== startingPromise) {
					return getCombinedPromise();
				}
			});
		};

		return getCombinedPromise().then(() => loadNewModulesPromise);
	}

	private fetchAllDependencies(module: Module) {
		const fetchDynamicImportsPromise = Promise.all(
			module.getDynamicImportExpressions().map((dynamicImportExpression, index) =>
				this.pluginDriver
					.hookFirst('resolveDynamicImport', [dynamicImportExpression, module.id])
					.then(replacement => {
						if (!replacement) return;
						const dynamicImport = module.dynamicImports[index];
						// TODO Lukas why can we assign to the module here?
						dynamicImport.alias = getAliasName(replacement);
						if (typeof dynamicImportExpression !== 'string') {
							dynamicImport.resolution = replacement;
						} else if (this.graph.isExternal(replacement, module.id, true)) {
							let externalModule;
							if (!this.modulesById.has(replacement)) {
								externalModule = new ExternalModule({
									graph: this.graph,
									id: replacement
								});
								this.modulesById.set(replacement, module);
							} else {
								externalModule = <ExternalModule>this.modulesById.get(replacement);
							}
							dynamicImport.resolution = externalModule;
							externalModule.exportsNamespace = true;
						} else {
							return this.fetchModule(replacement, module.id).then(depModule => {
								dynamicImport.resolution = depModule;
							});
						}
					})
			)
		);
		fetchDynamicImportsPromise.catch(() => {});

		return Promise.all(
			module.sources.map(source => this.resolveAndFetchDependency(module, source))
		).then(() => fetchDynamicImportsPromise);
	}

	private fetchModule(id: string, importer: string): Promise<Module> {
		const existingModule = this.modulesById.get(id);
		if (existingModule) {
			if (existingModule.isExternal) throw new Error(`Cannot fetch external module ${id}`);
			return Promise.resolve(<Module>existingModule);
		}

		const module: Module = new Module(this.graph, id);
		this.modulesById.set(id, module);

		timeStart('load modules', 3);
		return Promise.resolve(this.pluginDriver.hookFirst('load', [id]))
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
								ast: null,
								code: source
						  }
						: source;

				const cachedModule = this.graph.cachedModules.get(id);
				if (
					cachedModule &&
					!cachedModule.customTransformCache &&
					cachedModule.originalCode === sourceDescription.code
				) {
					// re-emit transform assets
					if (cachedModule.transformAssets) {
						for (const asset of cachedModule.transformAssets)
							this.pluginDriver.emitAsset(asset.name, asset.source);
					}
					return cachedModule;
				}

				return transform(this.graph, sourceDescription, module);
			})
			.then((source: ModuleJSON) => {
				module.setSource(source);

				this.modulesById.set(id, module);

				return this.fetchAllDependencies(module).then(() => {
					for (const name in module.exports) {
						if (name !== 'default') {
							module.exportsAll[name] = module.id;
						}
					}
					module.exportAllSources.forEach(source => {
						const id = module.resolvedIds[source].id;
						const exportAllModule = this.modulesById.get(id);
						if (exportAllModule.isExternal) return;

						for (const name in (<Module>exportAllModule).exportsAll) {
							if (name in module.exportsAll) {
								this.graph.warn({
									code: 'NAMESPACE_CONFLICT',
									message: `Conflicting namespaces: ${relativeId(
										module.id
									)} re-exports '${name}' from both ${relativeId(
										module.exportsAll[name]
									)} and ${relativeId(
										(<Module>exportAllModule).exportsAll[name]
									)} (will be ignored)`,
									name,
									reexporter: module.id,
									sources: [module.exportsAll[name], (<Module>exportAllModule).exportsAll[name]]
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

	private loadEntryModule = ({
		alias,
		unresolvedId
	}: UnresolvedModuleWithAlias): Promise<ModuleWithAlias> => {
		return this.pluginDriver
			.hookFirst<string | false | void>('resolveId', [unresolvedId, undefined])
			.then(id => {
				if (id === false) {
					error({
						code: 'UNRESOLVED_ENTRY',
						message: `Entry module cannot be external`
					});
				}

				if (id == null) {
					error({
						code: 'UNRESOLVED_ENTRY',
						message: `Could not resolve entry (${unresolvedId})`
					});
				}

				return this.fetchModule(<string>id, undefined).then(module => ({
					alias,
					module
				}));
			});
	};

	private normalizeResolveIdResult(
		resolveIdResult: ResolveIdResult,
		module: Module,
		source: string
	): ResolvedId {
		let id = '';
		let external = false;
		if (resolveIdResult) {
			if (typeof resolveIdResult === 'object') {
				id = resolveIdResult.id;
				if (resolveIdResult.external) {
					external = true;
				}
			} else {
				id = resolveIdResult;
				if (this.graph.isExternal(id, module.id, true)) {
					external = true;
				}
			}
			if (external) {
				id = normalizeRelativeExternalId(module.id, id);
			}
		} else {
			id = normalizeRelativeExternalId(module.id, source);
			external = true;
			if (resolveIdResult !== false && !this.graph.isExternal(id, module.id, true)) {
				if (isRelative(source)) {
					error({
						code: 'UNRESOLVED_IMPORT',
						message: `Could not resolve '${source}' from ${relativeId(module.id)}`
					});
				}
				this.graph.warn({
					code: 'UNRESOLVED_IMPORT',
					importer: relativeId(module.id),
					message: `'${source}' is imported by ${relativeId(
						module.id
					)}, but could not be resolved – treating it as an external dependency`,
					source,
					url: 'https://rollupjs.org/guide/en#warning-treating-module-as-external-dependency'
				});
			}
		}
		return { id, external };
	}

	private resolveAndFetchDependency(module: Module, source: string): Promise<any> {
		return Promise.resolve(
			module.resolvedIds[source] ||
				Promise.resolve(
					this.graph.isExternal(source, module.id, false)
						? { id: source, external: true }
						: this.pluginDriver.hookFirst<ResolveIdResult>('resolveId', [source, module.id])
				).then(result => this.normalizeResolveIdResult(result, module, source))
		).then(resolvedId => {
			module.resolvedIds[source] = resolvedId;
			if (resolvedId.external) {
				if (!this.modulesById.has(resolvedId.id)) {
					this.modulesById.set(
						resolvedId.id,
						new ExternalModule({ graph: this.graph, id: resolvedId.id })
					);
				}

				const externalModule = this.modulesById.get(resolvedId.id);
				if (externalModule instanceof ExternalModule === false) {
					error({
						code: 'INVALID_EXTERNAL_ID',
						message: `'${source}' is imported as an external by ${relativeId(
							module.id
						)}, but is already an existing non-external module id.`
					});
				}
			} else {
				return this.fetchModule(resolvedId.id, module.id);
			}
		});
	}
}
