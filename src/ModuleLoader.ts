import * as ESTree from 'estree';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import {
	ExternalOption,
	GetManualChunk,
	IsExternal,
	ModuleJSON,
	ModuleSideEffectsOption,
	PureModulesOption,
	ResolvedId,
	ResolveIdResult,
	TransformModuleJSON
} from './rollup/types';
import {
	errBadLoader,
	errCannotAssignModuleToChunk,
	errEntryCannotBeExternal,
	errInternalIdCannotBeExternal,
	errInvalidOption,
	errNamespaceConflict,
	error,
	errUnresolvedEntry,
	errUnresolvedImport,
	errUnresolvedImportTreatedAsExternal
} from './utils/error';
import { isRelative, resolve } from './utils/path';
import { PluginDriver } from './utils/pluginDriver';
import relativeId from './utils/relativeId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

export interface UnresolvedModule {
	fileName: string | null;
	id: string;
	name: string | null;
}

function normalizeRelativeExternalId(importer: string, source: string) {
	return isRelative(source) ? resolve(importer, '..', source) : source;
}

function getIdMatcher<T extends Array<any>>(
	option: boolean | string[] | ((id: string, ...args: T) => boolean | null | undefined)
): (id: string, ...args: T) => boolean {
	if (option === true) {
		return () => true;
	}
	if (typeof option === 'function') {
		return (id, ...args) => (!id.startsWith('\0') && option(id, ...args)) || false;
	}
	if (option) {
		const ids = new Set(Array.isArray(option) ? option : option ? [option] : []);
		return (id => ids.has(id)) as (id: string, ...args: T) => boolean;
	}
	return () => false;
}

function getHasModuleSideEffects(
	moduleSideEffectsOption: ModuleSideEffectsOption,
	pureExternalModules: PureModulesOption,
	graph: Graph
): (id: string, external: boolean) => boolean {
	if (typeof moduleSideEffectsOption === 'boolean') {
		return () => moduleSideEffectsOption;
	}
	if (moduleSideEffectsOption === 'no-external') {
		return (_id, external) => !external;
	}
	if (typeof moduleSideEffectsOption === 'function') {
		return (id, external) =>
			!id.startsWith('\0') ? moduleSideEffectsOption(id, external) !== false : true;
	}
	if (Array.isArray(moduleSideEffectsOption)) {
		const ids = new Set(moduleSideEffectsOption);
		return id => ids.has(id);
	}
	if (moduleSideEffectsOption) {
		graph.warn(
			errInvalidOption(
				'treeshake.moduleSideEffects',
				'please use one of false, "no-external", a function or an array'
			)
		);
	}
	const isPureExternalModule = getIdMatcher(pureExternalModules);
	return (id, external) => !(external && isPureExternalModule(id));
}

export class ModuleLoader {
	readonly isExternal: IsExternal;
	private readonly getManualChunk: GetManualChunk;
	private readonly graph: Graph;
	private readonly hasModuleSideEffects: (id: string, external: boolean) => boolean;
	private readonly indexedEntryModules: { index: number; module: Module }[] = [];
	private latestLoadModulesPromise: Promise<any> = Promise.resolve();
	private readonly manualChunkModules: Record<string, Module[]> = {};
	private readonly modulesById: Map<string, Module | ExternalModule>;
	private nextEntryModuleIndex = 0;
	private readonly pluginDriver: PluginDriver;

	constructor(
		graph: Graph,
		modulesById: Map<string, Module | ExternalModule>,
		pluginDriver: PluginDriver,
		external: ExternalOption,
		getManualChunk: GetManualChunk | null,
		moduleSideEffects: ModuleSideEffectsOption,
		pureExternalModules: PureModulesOption
	) {
		this.graph = graph;
		this.modulesById = modulesById;
		this.pluginDriver = pluginDriver;
		this.isExternal = getIdMatcher(external);
		this.hasModuleSideEffects = getHasModuleSideEffects(
			moduleSideEffects,
			pureExternalModules,
			graph
		);
		this.getManualChunk = typeof getManualChunk === 'function' ? getManualChunk : () => null;
	}

	addEntryModules(
		unresolvedEntryModules: UnresolvedModule[],
		isUserDefined: boolean
	): Promise<{
		entryModules: Module[];
		manualChunkModulesByAlias: Record<string, Module[]>;
		newEntryModules: Module[];
	}> {
		const firstEntryModuleIndex = this.nextEntryModuleIndex;
		this.nextEntryModuleIndex += unresolvedEntryModules.length;
		const loadNewEntryModulesPromise = Promise.all(
			unresolvedEntryModules.map(({ fileName, id, name }) =>
				this.loadEntryModule(id, true).then(module => {
					if (fileName !== null) {
						module.chunkFileNames.add(fileName);
					} else if (name !== null) {
						if (module.chunkName === null) {
							module.chunkName = name;
						}
						if (isUserDefined) {
							module.userChunkNames.add(name);
						}
					}
					return module;
				})
			)
		).then(entryModules => {
			let moduleIndex = firstEntryModuleIndex;
			for (const entryModule of entryModules) {
				entryModule.isUserDefinedEntryPoint = entryModule.isUserDefinedEntryPoint || isUserDefined;
				const existingIndexModule = this.indexedEntryModules.find(
					indexedModule => indexedModule.module.id === entryModule.id
				);
				if (!existingIndexModule) {
					this.indexedEntryModules.push({ module: entryModule, index: moduleIndex });
				} else {
					existingIndexModule.index = Math.min(existingIndexModule.index, moduleIndex);
				}
				moduleIndex++;
			}
			this.indexedEntryModules.sort(({ index: indexA }, { index: indexB }) =>
				indexA > indexB ? 1 : -1
			);
			return entryModules;
		});
		return this.awaitLoadModulesPromise(loadNewEntryModulesPromise).then(newEntryModules => ({
			entryModules: this.indexedEntryModules.map(({ module }) => module),
			manualChunkModulesByAlias: this.manualChunkModules,
			newEntryModules
		}));
	}

	addManualChunks(manualChunks: Record<string, string[]>): Promise<void> {
		const unresolvedManualChunks: { alias: string; id: string }[] = [];
		for (const alias of Object.keys(manualChunks)) {
			const manualChunkIds = manualChunks[alias];
			for (const id of manualChunkIds) {
				unresolvedManualChunks.push({ id, alias });
			}
		}
		const loadNewManualChunkModulesPromise = Promise.all(
			unresolvedManualChunks.map(({ id }) => this.loadEntryModule(id, false))
		).then(manualChunkModules => {
			for (let index = 0; index < manualChunkModules.length; index++) {
				this.addModuleToManualChunk(unresolvedManualChunks[index].alias, manualChunkModules[index]);
			}
		});

		return this.awaitLoadModulesPromise(loadNewManualChunkModulesPromise);
	}

	async resolveId(
		source: string,
		importer: string,
		skip?: number | null
	): Promise<ResolvedId | null> {
		return this.normalizeResolveIdResult(
			this.isExternal(source, importer, false)
				? false
				: await this.pluginDriver.hookFirst('resolveId', [source, importer], null, skip),
			importer,
			source
		);
	}

	private addModuleToManualChunk(alias: string, module: Module) {
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

		const getCombinedPromise = (): Promise<void> => {
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
				this.resolveDynamicImport(module, specifier as string | ESTree.Node, module.id).then(
					resolvedId => {
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
					}
				)
			)
		);
		fetchDynamicImportsPromise.catch(() => {});

		return Promise.all(
			module.sources.map(source => this.resolveAndFetchDependency(module, source))
		).then(() => fetchDynamicImportsPromise);
	}

	private fetchModule(
		id: string,
		importer: string,
		moduleSideEffects: boolean,
		isEntry: boolean
	): Promise<Module> {
		const existingModule = this.modulesById.get(id);
		if (existingModule) {
			if (existingModule instanceof ExternalModule)
				throw new Error(`Cannot fetch external module ${id}`);
			existingModule.isEntryPoint = existingModule.isEntryPoint || isEntry;
			return Promise.resolve(existingModule);
		}

		const module: Module = new Module(this.graph, id, moduleSideEffects, isEntry);
		this.modulesById.set(id, module);
		this.graph.watchFiles[id] = true;
		const manualChunkAlias = this.getManualChunk(id);
		if (typeof manualChunkAlias === 'string') {
			this.addModuleToManualChunk(manualChunkAlias, module);
		}

		timeStart('load modules', 3);
		return Promise.resolve(this.pluginDriver.hookFirst('load', [id]))
			.catch((err: Error) => {
				timeEnd('load modules', 3);
				let msg = `Could not load ${id}`;
				if (importer) msg += ` (imported by ${importer})`;
				msg += `: ${err.message}`;
				err.message = msg;
				throw err;
			})
			.then(source => {
				timeEnd('load modules', 3);
				if (typeof source === 'string') return { code: source };
				if (source && typeof source === 'object' && typeof source.code === 'string') return source;
				return error(errBadLoader(id));
			})
			.then(sourceDescription => {
				const cachedModule = this.graph.cachedModules.get(id);
				if (
					cachedModule &&
					!cachedModule.customTransformCache &&
					cachedModule.originalCode === sourceDescription.code
				) {
					if (cachedModule.transformFiles) {
						for (const emittedFile of cachedModule.transformFiles)
							this.pluginDriver.emitFile(emittedFile);
					}
					return cachedModule;
				}

				if (typeof sourceDescription.moduleSideEffects === 'boolean') {
					module.moduleSideEffects = sourceDescription.moduleSideEffects;
				}
				return transform(this.graph, sourceDescription, module);
			})
			.then((source: TransformModuleJSON | ModuleJSON) => {
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

						for (const name in (exportAllModule as Module).exportsAll) {
							if (name in module.exportsAll) {
								this.graph.warn(errNamespaceConflict(name, module, exportAllModule as Module));
							} else {
								module.exportsAll[name] = (exportAllModule as Module).exportsAll[name];
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
					new ExternalModule(this.graph, resolvedId.id, resolvedId.moduleSideEffects)
				);
			}

			const externalModule = this.modulesById.get(resolvedId.id);
			if (!(externalModule instanceof ExternalModule)) {
				return error(errInternalIdCannotBeExternal(source, importer));
			}
			return Promise.resolve(externalModule);
		} else {
			return this.fetchModule(resolvedId.id, importer, resolvedId.moduleSideEffects, false);
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
			return {
				external: true,
				id: source,
				moduleSideEffects: this.hasModuleSideEffects(source, true)
			};
		}
		return resolvedId;
	}

	private loadEntryModule = (unresolvedId: string, isEntry: boolean): Promise<Module> =>
		this.pluginDriver.hookFirst('resolveId', [unresolvedId, undefined]).then(resolveIdResult => {
			if (
				resolveIdResult === false ||
				(resolveIdResult && typeof resolveIdResult === 'object' && resolveIdResult.external)
			) {
				return error(errEntryCannotBeExternal(unresolvedId));
			}
			const id =
				resolveIdResult && typeof resolveIdResult === 'object'
					? resolveIdResult.id
					: resolveIdResult;

			if (typeof id === 'string') {
				return this.fetchModule(id, undefined as any, true, isEntry);
			}
			return error(errUnresolvedEntry(unresolvedId));
		});

	private normalizeResolveIdResult(
		resolveIdResult: ResolveIdResult,
		importer: string,
		source: string
	): ResolvedId | null {
		let id = '';
		let external = false;
		let moduleSideEffects = null;
		if (resolveIdResult) {
			if (typeof resolveIdResult === 'object') {
				id = resolveIdResult.id;
				if (resolveIdResult.external) {
					external = true;
				}
				if (typeof resolveIdResult.moduleSideEffects === 'boolean') {
					moduleSideEffects = resolveIdResult.moduleSideEffects;
				}
			} else {
				if (this.isExternal(resolveIdResult, importer, true)) {
					external = true;
				}
				id = external ? normalizeRelativeExternalId(importer, resolveIdResult) : resolveIdResult;
			}
		} else {
			id = normalizeRelativeExternalId(importer, source);
			if (resolveIdResult !== false && !this.isExternal(id, importer, true)) {
				return null;
			}
			external = true;
		}
		return {
			external,
			id,
			moduleSideEffects:
				typeof moduleSideEffects === 'boolean'
					? moduleSideEffects
					: this.hasModuleSideEffects(id, external)
		};
	}

	private async resolveAndFetchDependency(
		module: Module,
		source: string
	): Promise<Module | ExternalModule> {
		return this.fetchResolvedDependency(
			source,
			module.id,
			(module.resolvedIds[source] =
				module.resolvedIds[source] ||
				this.handleMissingImports(await this.resolveId(source, module.id), source, module.id))
		);
	}

	private async resolveDynamicImport(
		module: Module,
		specifier: string | ESTree.Node,
		importer: string
	): Promise<ResolvedId | string | null> {
		// TODO we only should expose the acorn AST here
		const resolution = await this.pluginDriver.hookFirst('resolveDynamicImport', [
			specifier,
			importer
		]);
		if (typeof specifier !== 'string') {
			if (typeof resolution === 'string') {
				return resolution;
			}
			if (!resolution) {
				return null;
			}
			return {
				external: false,
				moduleSideEffects: true,
				...resolution
			} as ResolvedId;
		}
		if (resolution == null) {
			return (module.resolvedIds[specifier] =
				module.resolvedIds[specifier] ||
				this.handleMissingImports(
					await this.resolveId(specifier, module.id),
					specifier,
					module.id
				));
		}
		return this.handleMissingImports(
			this.normalizeResolveIdResult(resolution, importer, specifier),
			specifier,
			importer
		);
	}
}
