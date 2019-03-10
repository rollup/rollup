import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import { ModuleJSON, ResolvedId, ResolveIdResult, SourceDescription } from './rollup/types';
import { error } from './utils/error';
import { isRelative, resolve } from './utils/path';
import relativeId, { getAliasName } from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

function normalizeRelativeExternalId(importee: string, source: string) {
	return isRelative(source) ? resolve(importee, '..', source) : source;
}

export class ModuleLoader {
	private readonly graph: Graph;
	private readonly modulesById: Map<string, Module | ExternalModule>;

	// TODO Lukas get rid of graph dependence
	constructor(graph: Graph, modulesById: Map<string, Module | ExternalModule>) {
		this.graph = graph;
		this.modulesById = modulesById;
	}

	loadEntryModules(
		entryModules: string | string[] | Record<string, string>,
		manualChunks: Record<string, string[]> | void
	) {
		// TODO Lukas the aliasing of entry modules could happen outside
		let deriveAliasFromId = false;
		let entryModuleIds: string[];
		let entryModuleAliases: string[];
		if (typeof entryModules === 'string') entryModules = [entryModules];

		if (Array.isArray(entryModules)) {
			deriveAliasFromId = true;
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

		// TODO Lukas We want to return a Promise which we do not know completely yet
		// - We create a manual Promise
		// - The resolved Promise.all checks if new entries are added. If not, it resolves, otherwise it does another Promise.all
		// - First collect all entries
		return Promise.all(entryAndManualChunkIds.map(id => this.loadEntryModule(id))).then(
			entryAndChunkModules => {
				if (deriveAliasFromId) {
					for (let i = 0; i < entryModuleAliases.length; i++)
						entryModuleAliases[i] = getAliasName(entryAndChunkModules[i].id);
				}

				const entryModules = entryAndChunkModules.slice(0, entryModuleIds.length);

				let manualChunkModules: { [chunkName: string]: Module[] };
				if (manualChunks) {
					manualChunkModules = {};
					for (const chunkName of Object.keys(manualChunks)) {
						const chunk = manualChunks[chunkName];
						console.log(entryAndChunkModules);
						manualChunkModules[chunkName] = chunk.map(
							entryId => entryAndChunkModules[entryAndManualChunkIds.indexOf(entryId)]
						);
					}
				}

				// TODO Lukas at this point, the entry modules need to contain all entry points
				return { entryModules, entryModuleAliases, manualChunkModules };
			}
		);
	}

	// // TODO Lukas in an ideal world, all entries pass through here
	// public addEntries() {
	// }
	//
	// public addManualChunks() {
	// }

	private fetchAllDependencies(module: Module) {
		const fetchDynamicImportsPromise = Promise.all(
			module.getDynamicImportExpressions().map((dynamicImportExpression, index) =>
				this.graph.pluginDriver
					.hookFirst('resolveDynamicImport', [dynamicImportExpression, module.id])
					.then(replacement => {
						if (!replacement) return;
						const dynamicImport = module.dynamicImports[index];
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
		return Promise.resolve(this.graph.pluginDriver.hookFirst('load', [id]))
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
							this.graph.pluginDriver.emitAsset(asset.name, asset.source);
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

	private loadEntryModule(entryName: string) {
		return this.graph.pluginDriver
			.hookFirst<string | false | void>('resolveId', [entryName, undefined])
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
						message: `Could not resolve entry (${entryName})`
					});
				}

				return this.fetchModule(<string>id, undefined);
			});
	}

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
		}else {
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
					: this.graph.pluginDriver.hookFirst<ResolveIdResult>('resolveId', [source, module.id])
			).then(result => this.normalizeResolveIdResult(result, module, source))
		).then(resolvedId => {
			module.resolvedIds[source] = resolvedId;
			if (resolvedId.external) {
				if (!this.modulesById.has(resolvedId.id)) {
					this.modulesById.set(resolvedId.id, new ExternalModule({ graph: this.graph, id: resolvedId.id }));
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
