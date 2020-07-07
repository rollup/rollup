import * as acorn from 'acorn';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import {
	EmittedChunk,
	HasModuleSideEffects,
	NormalizedInputOptions,
	ResolvedId,
	ResolveIdResult,
	SourceDescription
} from './rollup/types';
import {
	errBadLoader,
	errEntryCannotBeExternal,
	errExternalSyntheticExports,
	errImplicitDependantCannotBeExternal,
	errInternalIdCannotBeExternal,
	error,
	errUnresolvedEntry,
	errUnresolvedImplicitDependant,
	errUnresolvedImport,
	errUnresolvedImportTreatedAsExternal
} from './utils/error';
import { readFile } from './utils/fs';
import { isRelative, resolve } from './utils/path';
import { PluginDriver } from './utils/PluginDriver';
import relativeId from './utils/relativeId';
import { resolveId } from './utils/resolveId';
import { timeEnd, timeStart } from './utils/timers';
import transform from './utils/transform';

export interface UnresolvedModule {
	fileName: string | null;
	id: string;
	importer: string | undefined;
	name: string | null;
}

export class ModuleLoader {
	private readonly hasModuleSideEffects: HasModuleSideEffects;
	private readonly implicitEntryModules = new Set<Module>();
	private readonly indexedEntryModules: { index: number; module: Module }[] = [];
	private latestLoadModulesPromise: Promise<any> = Promise.resolve();
	private nextEntryModuleIndex = 0;

	constructor(
		private readonly graph: Graph,
		private readonly modulesById: Map<string, Module | ExternalModule>,
		private readonly options: NormalizedInputOptions,
		private readonly pluginDriver: PluginDriver
	) {
		this.hasModuleSideEffects = options.treeshake
			? options.treeshake.moduleSideEffects
			: () => true;
	}

	async addAdditionalModules(unresolvedModules: string[]): Promise<Module[]> {
		const result = this.extendLoadModulesPromise(
			Promise.all(unresolvedModules.map(id => this.loadEntryModule(id, false, undefined, null)))
		);
		await this.awaitLoadModulesPromise();
		return result;
	}

	async addEntryModules(
		unresolvedEntryModules: UnresolvedModule[],
		isUserDefined: boolean
	): Promise<{
		entryModules: Module[];
		implicitEntryModules: Module[];
		newEntryModules: Module[];
	}> {
		const firstEntryModuleIndex = this.nextEntryModuleIndex;
		this.nextEntryModuleIndex += unresolvedEntryModules.length;
		const newEntryModules = await this.extendLoadModulesPromise(
			Promise.all(
				unresolvedEntryModules.map(
					({ id, importer }): Promise<Module> => this.loadEntryModule(id, true, importer, null)
				)
			).then(entryModules => {
				let moduleIndex = firstEntryModuleIndex;
				for (let index = 0; index < entryModules.length; index++) {
					const entryModule = entryModules[index];
					entryModule.isUserDefinedEntryPoint =
						entryModule.isUserDefinedEntryPoint || isUserDefined;
					addChunkNamesToModule(entryModule, unresolvedEntryModules[index], isUserDefined);
					const existingIndexedModule = this.indexedEntryModules.find(
						indexedModule => indexedModule.module === entryModule
					);
					if (!existingIndexedModule) {
						this.indexedEntryModules.push({ module: entryModule, index: moduleIndex });
					} else {
						existingIndexedModule.index = Math.min(existingIndexedModule.index, moduleIndex);
					}
					moduleIndex++;
				}
				this.indexedEntryModules.sort(({ index: indexA }, { index: indexB }) =>
					indexA > indexB ? 1 : -1
				);
				return entryModules;
			})
		);
		await this.awaitLoadModulesPromise();
		return {
			entryModules: this.indexedEntryModules.map(({ module }) => module),
			implicitEntryModules: [...this.implicitEntryModules],
			newEntryModules
		};
	}

	async emitChunk({
		fileName,
		id,
		importer,
		name,
		implicitlyLoadedAfterOneOf,
		preserveSignature
	}: EmittedChunk): Promise<Module> {
		const unresolvedModule: UnresolvedModule = {
			fileName: fileName || null,
			id,
			importer,
			name: name || null
		};
		const module = implicitlyLoadedAfterOneOf
			? await this.addEntryWithImplicitDependants(unresolvedModule, implicitlyLoadedAfterOneOf)
			: (await this.addEntryModules([unresolvedModule], false)).newEntryModules[0];
		if (preserveSignature != null) {
			module.preserveSignature = preserveSignature;
		}
		return module;
	}

	async resolveId(
		source: string,
		importer: string | undefined,
		skip: number | null = null
	): Promise<ResolvedId | null> {
		return this.normalizeResolveIdResult(
			this.options.external(source, importer, false)
				? false
				: await resolveId(source, importer, this.options.preserveSymlinks, this.pluginDriver, skip),

			importer,
			source
		);
	}

	private addEntryWithImplicitDependants(
		unresolvedModule: UnresolvedModule,
		implicitlyLoadedAfter: string[]
	): Promise<Module> {
		return this.extendLoadModulesPromise(
			this.loadEntryModule(unresolvedModule.id, false, unresolvedModule.importer, null).then(
				async entryModule => {
					addChunkNamesToModule(entryModule, unresolvedModule, false);
					if (!entryModule.isEntryPoint) {
						this.implicitEntryModules.add(entryModule);
						const implicitlyLoadedAfterModules = await Promise.all(
							implicitlyLoadedAfter.map(id =>
								this.loadEntryModule(id, false, unresolvedModule.importer, entryModule.id)
							)
						);
						for (const module of implicitlyLoadedAfterModules) {
							entryModule.implicitlyLoadedAfter.add(module);
						}
						for (const dependant of entryModule.implicitlyLoadedAfter) {
							dependant.implicitlyLoadedBefore.add(entryModule);
						}
					}
					return entryModule;
				}
			)
		);
	}

	private async addModuleSource(id: string, importer: string | undefined, module: Module) {
		timeStart('load modules', 3);
		let source: string | SourceDescription;
		try {
			source = (await this.pluginDriver.hookFirst('load', [id])) ?? (await readFile(id));
		} catch (err) {
			timeEnd('load modules', 3);
			let msg = `Could not load ${id}`;
			if (importer) msg += ` (imported by ${relativeId(importer)})`;
			msg += `: ${err.message}`;
			err.message = msg;
			throw err;
		}
		timeEnd('load modules', 3);
		const sourceDescription =
			typeof source === 'string'
				? { code: source }
				: typeof source === 'object' && typeof source.code === 'string'
				? source
				: error(errBadLoader(id));
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
			module.setSource(cachedModule);
		} else {
			if (sourceDescription.moduleSideEffects != null) {
				module.moduleSideEffects = sourceDescription.moduleSideEffects;
			}
			if (sourceDescription.syntheticNamedExports != null) {
				module.syntheticNamedExports = sourceDescription.syntheticNamedExports;
			}
			module.setSource(
				await transform(sourceDescription, module, this.pluginDriver, this.options.onwarn)
			);
		}
	}

	private async awaitLoadModulesPromise(): Promise<void> {
		let startingPromise;
		do {
			startingPromise = this.latestLoadModulesPromise;
			await startingPromise;
		} while (startingPromise !== this.latestLoadModulesPromise);
	}

	private extendLoadModulesPromise<T>(loadNewModulesPromise: Promise<T>): Promise<T> {
		this.latestLoadModulesPromise = Promise.all([
			loadNewModulesPromise,
			this.latestLoadModulesPromise
		]);
		this.latestLoadModulesPromise.catch(() => {
			/* Avoid unhandled Promise rejections */
		});
		return loadNewModulesPromise;
	}

	private async fetchDynamicDependencies(module: Module): Promise<void> {
		const dependencies = await Promise.all(
			module.dynamicImports.map(async dynamicImport => {
				const resolvedId = await this.resolveDynamicImport(
					module,
					dynamicImport.argument,
					module.id
				);
				if (resolvedId === null) return null;
				if (typeof resolvedId === 'string') {
					dynamicImport.resolution = resolvedId;
					return null;
				}
				return (dynamicImport.resolution = await this.fetchResolvedDependency(
					relativeId(resolvedId.id),
					module.id,
					resolvedId
				));
			})
		);
		for (const dependency of dependencies) {
			if (dependency) {
				module.dynamicDependencies.add(dependency);
				dependency.dynamicImporters.push(module.id);
			}
		}
	}

	private async fetchModule(
		id: string,
		importer: string | undefined,
		moduleSideEffects: boolean | 'no-treeshake',
		syntheticNamedExports: boolean,
		isEntry: boolean
	): Promise<Module> {
		const existingModule = this.modulesById.get(id);
		if (existingModule instanceof Module) {
			if (isEntry) {
				existingModule.isEntryPoint = true;
				this.implicitEntryModules.delete(existingModule);
				for (const dependant of existingModule.implicitlyLoadedAfter) {
					dependant.implicitlyLoadedBefore.delete(existingModule);
				}
				existingModule.implicitlyLoadedAfter.clear();
			}
			return existingModule;
		}

		const module: Module = new Module(
			this.graph,
			id,
			this.options,
			moduleSideEffects,
			syntheticNamedExports,
			isEntry
		);
		this.modulesById.set(id, module);
		this.graph.watchFiles[id] = true;
		await this.addModuleSource(id, importer, module);
		await Promise.all([
			this.fetchStaticDependencies(module),
			this.fetchDynamicDependencies(module)
		]);
		module.linkImports();
		return module;
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
					new ExternalModule(this.options, resolvedId.id, resolvedId.moduleSideEffects)
				);
			}

			const externalModule = this.modulesById.get(resolvedId.id);
			if (!(externalModule instanceof ExternalModule)) {
				return error(errInternalIdCannotBeExternal(source, importer));
			}
			return Promise.resolve(externalModule);
		} else {
			return this.fetchModule(
				resolvedId.id,
				importer,
				resolvedId.moduleSideEffects,
				resolvedId.syntheticNamedExports,
				false
			);
		}
	}

	private async fetchStaticDependencies(module: Module): Promise<void> {
		for (const dependency of await Promise.all(
			Array.from(module.sources, async source =>
				this.fetchResolvedDependency(
					source,
					module.id,
					(module.resolvedIds[source] =
						module.resolvedIds[source] ||
						this.handleResolveId(await this.resolveId(source, module.id), source, module.id))
				)
			)
		)) {
			module.dependencies.add(dependency);
			dependency.importers.push(module.id);
		}
	}

	private handleResolveId(
		resolvedId: ResolvedId | null,
		source: string,
		importer: string
	): ResolvedId {
		if (resolvedId === null) {
			if (isRelative(source)) {
				return error(errUnresolvedImport(source, importer));
			}
			this.options.onwarn(errUnresolvedImportTreatedAsExternal(source, importer));
			return {
				external: true,
				id: source,
				moduleSideEffects: this.hasModuleSideEffects(source, true),
				syntheticNamedExports: false
			};
		} else {
			if (resolvedId.external && resolvedId.syntheticNamedExports) {
				this.options.onwarn(errExternalSyntheticExports(source, importer));
			}
		}
		return resolvedId;
	}

	private async loadEntryModule(
		unresolvedId: string,
		isEntry: boolean,
		importer: string | undefined,
		implicitlyLoadedBefore: string | null
	): Promise<Module> {
		const resolveIdResult = await resolveId(
			unresolvedId,
			importer,
			this.options.preserveSymlinks,
			this.pluginDriver,
			null
		);
		if (
			resolveIdResult === false ||
			(resolveIdResult && typeof resolveIdResult === 'object' && resolveIdResult.external)
		) {
			return error(
				implicitlyLoadedBefore === null
					? errEntryCannotBeExternal(unresolvedId)
					: errImplicitDependantCannotBeExternal(unresolvedId, implicitlyLoadedBefore)
			);
		}
		const id =
			resolveIdResult && typeof resolveIdResult === 'object' ? resolveIdResult.id : resolveIdResult;

		if (typeof id === 'string') {
			return this.fetchModule(id, undefined, true, false, isEntry);
		}
		return error(
			implicitlyLoadedBefore === null
				? errUnresolvedEntry(unresolvedId)
				: errUnresolvedImplicitDependant(unresolvedId, implicitlyLoadedBefore)
		);
	}

	private normalizeResolveIdResult(
		resolveIdResult: ResolveIdResult,
		importer: string | undefined,
		source: string
	): ResolvedId | null {
		let id = '';
		let external = false;
		let moduleSideEffects: boolean | 'no-treeshake' | null = null;
		let syntheticNamedExports = false;
		if (resolveIdResult) {
			if (typeof resolveIdResult === 'object') {
				id = resolveIdResult.id;
				if (resolveIdResult.external) {
					external = true;
				}
				if (resolveIdResult.moduleSideEffects != null) {
					moduleSideEffects = resolveIdResult.moduleSideEffects;
				}
				if (resolveIdResult.syntheticNamedExports != null) {
					syntheticNamedExports = resolveIdResult.syntheticNamedExports;
				}
			} else {
				if (this.options.external(resolveIdResult, importer, true)) {
					external = true;
				}
				id = external ? normalizeRelativeExternalId(resolveIdResult, importer) : resolveIdResult;
			}
		} else {
			id = normalizeRelativeExternalId(source, importer);
			if (resolveIdResult !== false && !this.options.external(id, importer, true)) {
				return null;
			}
			external = true;
		}
		return {
			external,
			id,
			moduleSideEffects: moduleSideEffects ?? this.hasModuleSideEffects(id, external),
			syntheticNamedExports
		};
	}

	private async resolveDynamicImport(
		module: Module,
		specifier: string | acorn.Node,
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
				this.handleResolveId(await this.resolveId(specifier, module.id), specifier, module.id));
		}
		return this.handleResolveId(
			this.normalizeResolveIdResult(resolution, importer, specifier),
			specifier,
			importer
		);
	}
}

function normalizeRelativeExternalId(source: string, importer: string | undefined): string {
	return isRelative(source)
		? importer
			? resolve(importer, '..', source)
			: resolve(source)
		: source;
}

function addChunkNamesToModule(
	module: Module,
	{ fileName, name }: UnresolvedModule,
	isUserDefined: boolean
) {
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
}
