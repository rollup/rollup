import * as ESTree from 'estree';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import {
	ExternalOption,
	GetManualChunk,
	IsExternal,
	ModuleJSON,
	ResolvedId,
	ResolveIdResult,
	SourceDescription
} from './rollup/types';
import {
	errBadLoader,
	errCannotAssignModuleToChunk,
	errChunkNotGeneratedForFileName,
	errChunkReferenceIdNotFoundForFilename,
	errEntryCannotBeExternal,
	errInternalIdCannotBeExternal,
	errNamespaceConflict,
	error,
	errUnresolvedEntry,
	errUnresolvedImport,
	errUnresolvedImportTreatedAsExternal
} from './utils/error';
import { isRelative, resolve } from './utils/path';
import { PluginDriver } from './utils/pluginDriver';
import { addWithNewReferenceId } from './utils/referenceIds';
import relativeId from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

export interface UnresolvedModuleWithAlias {
	alias: string | null;
	unresolvedId: string;
}

interface UnresolvedEntryModuleWithAlias extends UnresolvedModuleWithAlias {
	manualChunkAlias?: string;
}

function normalizeRelativeExternalId(importer: string, source: string) {
	return isRelative(source) ? resolve(importer, '..', source) : source;
}

export class ModuleLoader {
	readonly isExternal: IsExternal;
	private readonly entriesByReferenceId = new Map<
		string,
		{ module: Module | null; name: string }
	>();
	private readonly entryModules: Module[] = [];
	private readonly getManualChunk: GetManualChunk;
	private readonly graph: Graph;
	private latestLoadModulesPromise: Promise<any> = Promise.resolve();
	private readonly manualChunkModules: Record<string, Module[]> = {};
	private readonly modulesById: Map<string, Module | ExternalModule>;
	private readonly pluginDriver: PluginDriver;

	constructor(
		graph: Graph,
		modulesById: Map<string, Module | ExternalModule>,
		pluginDriver: PluginDriver,
		external: ExternalOption,
		getManualChunk: GetManualChunk | null
	) {
		this.graph = graph;
		this.modulesById = modulesById;
		this.pluginDriver = pluginDriver;
		if (typeof external === 'function') {
			this.isExternal = (id, parentId, isResolved) =>
				!id.startsWith('\0') && external(id, parentId, isResolved);
		} else {
			const ids = new Set(Array.isArray(external) ? external : external ? [external] : []);
			this.isExternal = id => ids.has(id);
		}
		this.getManualChunk = typeof getManualChunk === 'function' ? getManualChunk : () => null;
	}

	addEntryModuleAndGetReferenceId(unresolvedEntryModule: UnresolvedModuleWithAlias): string {
		const entryRecord: { module: Module | null; name: string } = {
			module: null,
			name: unresolvedEntryModule.unresolvedId
		};
		const referenceId = addWithNewReferenceId(
			entryRecord,
			this.entriesByReferenceId,
			unresolvedEntryModule.unresolvedId
		);
		this.addEntryModules([unresolvedEntryModule], false)
			.then(({ newEntryModules: [module] }) => {
				entryRecord.module = module;
			})
			.catch(() => {
				// Avoid unhandled Promise rejection as the error will be thrown later
				// once module loading has finished
			});
		return referenceId;
	}

	addEntryModules(
		unresolvedEntryModules: UnresolvedModuleWithAlias[],
		isUserDefined: boolean
	): Promise<{
		entryModules: Module[];
		manualChunkModulesByAlias: Record<string, Module[]>;
		newEntryModules: Module[];
	}> {
		const loadNewEntryModulesPromise = Promise.all(
			unresolvedEntryModules.map(this.loadEntryModule)
		).then(entryModules => {
			for (const entryModule of entryModules) {
				entryModule.isUserDefinedEntryPoint = entryModule.isUserDefinedEntryPoint || isUserDefined;
				const existingEntryModule = this.entryModules.find(module => module.id === entryModule.id);
				if (!existingEntryModule) {
					this.entryModules.push(entryModule);
				}
			}
			return entryModules;
		});
		return this.awaitLoadModulesPromise(loadNewEntryModulesPromise).then(newEntryModules => ({
			entryModules: this.entryModules,
			manualChunkModulesByAlias: this.manualChunkModules,
			newEntryModules
		}));
	}

	addManualChunks(manualChunks: Record<string, string[]>): Promise<void> {
		const unresolvedManualChunks: UnresolvedEntryModuleWithAlias[] = [];
		for (const alias of Object.keys(manualChunks)) {
			const manualChunkIds = manualChunks[alias];
			for (const unresolvedId of manualChunkIds) {
				unresolvedManualChunks.push({ alias: null, unresolvedId, manualChunkAlias: alias });
			}
		}
		const loadNewManualChunkModulesPromise = Promise.all(
			unresolvedManualChunks.map(this.loadEntryModule)
		).then(manualChunkModules => {
			for (let index = 0; index < manualChunkModules.length; index++) {
				this.addToManualChunk(
					unresolvedManualChunks[index].manualChunkAlias,
					manualChunkModules[index]
				);
			}
		});

		return this.awaitLoadModulesPromise(loadNewManualChunkModulesPromise);
	}

	getChunkFileName(referenceId: string): string {
		const entryRecord = this.entriesByReferenceId.get(referenceId);
		if (!entryRecord) error(errChunkReferenceIdNotFoundForFilename(referenceId));
		const fileName =
			entryRecord.module &&
			(entryRecord.module.facadeChunk
				? entryRecord.module.facadeChunk.id
				: entryRecord.module.chunk.id);
		if (!fileName) error(errChunkNotGeneratedForFileName(entryRecord));
		return fileName;
	}

	resolveId(source: string, importer: string): Promise<ResolvedId | null> {
		return Promise.resolve(
			this.isExternal(source, importer, false)
				? { id: source, external: true }
				: this.pluginDriver.hookFirst('resolveId', [source, importer])
		).then((result: ResolveIdResult) => this.normalizeResolveIdResult(result, importer, source));
	}

	private addToManualChunk(alias: string, module: Module) {
		if (module.manualChunkAlias !== null && module.manualChunkAlias !== alias) {
			error(errCannotAssignModuleToChunk(module.id, alias, module.manualChunkAlias));
		}
		module.manualChunkAlias = alias;
		if (!this.manualChunkModules[alias]) {
			this.manualChunkModules[alias] = [];
		}
		this.manualChunkModules[alias].push(module);
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
			module.getDynamicImportExpressions().map((specifier, index) =>
				this.resolveDynamicImport(specifier as string | ESTree.Node, module.id).then(resolvedId => {
					if (resolvedId === null) return;
					const dynamicImport = module.dynamicImports[index];
					if (typeof resolvedId === 'string') {
						dynamicImport.resolution = resolvedId;
						return;
					}
					return this.fetchResolvedDependency(
						relativeId(resolvedId.id),
						module.id,
						resolvedId
					).then(module => {
						dynamicImport.resolution = module;
					});
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
		const manualChunkAlias = this.getManualChunk(id);
		if (typeof manualChunkAlias === 'string') {
			this.addToManualChunk(manualChunkAlias, module);
		}

		timeStart('load modules', 3);
		return Promise.resolve(
			this.pluginDriver.hookFirst<'load', string | SourceDescription>('load', [id])
		)
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
				error(errBadLoader(id));
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
						if (exportAllModule instanceof ExternalModule) return;

						for (const name in exportAllModule.exportsAll) {
							if (name in module.exportsAll) {
								this.graph.warn(errNamespaceConflict(name, module, exportAllModule));
							} else {
								module.exportsAll[name] = exportAllModule.exportsAll[name];
							}
						}
					});
					return module;
				});
			});
	}

	private fetchResolvedDependency(
		source: string,
		importer: string,
		resolvedId: ResolvedId
	): Promise<Module | ExternalModule> {
		if (resolvedId.external) {
			if (!this.modulesById.has(resolvedId.id)) {
				this.modulesById.set(
					resolvedId.id,
					new ExternalModule({ graph: this.graph, id: resolvedId.id })
				);
			}

			const externalModule = this.modulesById.get(resolvedId.id);
			if (externalModule instanceof ExternalModule === false) {
				error(errInternalIdCannotBeExternal(source, importer));
			}
			return Promise.resolve(externalModule);
		} else {
			return this.fetchModule(resolvedId.id, importer);
		}
	}

	private handleMissingImports(
		resolvedId: ResolvedId | null,
		source: string,
		importer: string
	): ResolvedId {
		if (resolvedId === null) {
			if (isRelative(source)) {
				error(errUnresolvedImport(source, importer));
			}
			this.graph.warn(errUnresolvedImportTreatedAsExternal(source, importer));
			return { id: source, external: true };
		}
		return resolvedId;
	}

	private loadEntryModule = ({ alias, unresolvedId }: UnresolvedModuleWithAlias): Promise<Module> =>
		this.pluginDriver
			.hookFirst('resolveId', [unresolvedId, undefined])
			.then((resolveIdResult: ResolveIdResult) => {
				if (
					resolveIdResult === false ||
					(resolveIdResult && typeof resolveIdResult === 'object' && resolveIdResult.external)
				) {
					error(errEntryCannotBeExternal(unresolvedId));
				}
				const id =
					resolveIdResult && typeof resolveIdResult === 'object'
						? resolveIdResult.id
						: resolveIdResult;

				if (typeof id === 'string') {
					return this.fetchModule(id, undefined).then(module => {
						if (alias !== null) {
							if (module.chunkAlias !== null && module.chunkAlias !== alias) {
								error(errCannotAssignModuleToChunk(module.id, alias, module.chunkAlias));
							}
							module.chunkAlias = alias;
						}
						return module;
					});
				}
				error(errUnresolvedEntry(unresolvedId));
			});

	private normalizeResolveIdResult(
		resolveIdResult: ResolveIdResult,
		importer: string,
		source: string
	): ResolvedId | null {
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
				if (this.isExternal(id, importer, true)) {
					external = true;
				}
			}
			if (external) {
				id = normalizeRelativeExternalId(importer, id);
			}
		} else {
			id = normalizeRelativeExternalId(importer, source);
			if (resolveIdResult !== false && !this.isExternal(id, importer, true)) {
				return null;
			}
			external = true;
		}
		return { id, external };
	}

	private resolveAndFetchDependency(
		module: Module,
		source: string
	): Promise<Module | ExternalModule> {
		return Promise.resolve(
			module.resolvedIds[source] ||
				this.resolveId(source, module.id).then(resolvedId =>
					this.handleMissingImports(resolvedId, source, module.id)
				)
		).then(resolvedId => {
			module.resolvedIds[source] = resolvedId;
			return this.fetchResolvedDependency(source, module.id, resolvedId);
		});
	}

	private resolveDynamicImport(
		specifier: string | ESTree.Node,
		importer: string
	): Promise<ResolvedId | string | null> {
		// TODO we only should expose the acorn AST here
		return this.pluginDriver
			.hookFirst('resolveDynamicImport', [specifier, importer])
			.then((resolution: ResolveIdResult) => {
				if (typeof specifier !== 'string') {
					if (typeof resolution === 'string') {
						return resolution;
					}
					if (!resolution) {
						return null;
					}
					return {
						external: false,
						...resolution
					};
				}
				if (resolution == null) {
					return this.resolveId(specifier, importer).then(resolvedId =>
						this.handleMissingImports(resolvedId, specifier, importer)
					);
				}
				return this.handleMissingImports(
					this.normalizeResolveIdResult(resolution, importer, specifier),
					specifier,
					importer
				);
			});
	}
}
