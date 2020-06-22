import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import {
	GetManualChunk,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundle,
	OutputBundleWithPlaceholders,
	OutputChunk
} from './rollup/types';
import { Addons, createAddons } from './utils/addons';
import { getChunkAssignments } from './utils/chunkAssignment';
import commondir from './utils/commondir';
import { errCannotAssignModuleToChunk, error, warnDeprecation } from './utils/error';
import { sortByExecutionOrder } from './utils/executionOrder';
import { FILE_PLACEHOLDER } from './utils/FileEmitter';
import { basename, isAbsolute } from './utils/path';
import { PluginDriver } from './utils/PluginDriver';
import { timeEnd, timeStart } from './utils/timers';

export default class Bundle {
	private facadeChunkByModule = new Map<Module, Chunk>();

	constructor(
		private readonly outputOptions: NormalizedOutputOptions,
		private readonly unsetOptions: Set<string>,
		private readonly inputOptions: NormalizedInputOptions,
		private readonly pluginDriver: PluginDriver,
		private readonly graph: Graph
	) {}

	async generate(isWrite: boolean): Promise<OutputBundle> {
		timeStart('GENERATE', 1);
		const outputBundle: OutputBundleWithPlaceholders = Object.create(null);
		this.pluginDriver.setOutputBundle(
			outputBundle,
			this.outputOptions.assetFileNames,
			this.facadeChunkByModule
		);
		try {
			await this.pluginDriver.hookParallel('renderStart', [this.outputOptions, this.inputOptions]);

			timeStart('generate chunks', 2);
			const chunks = await this.generateChunks();
			if (chunks.length > 1) {
				validateOptionsForMultiChunkOutput(this.outputOptions);
			}
			const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));
			timeEnd('generate chunks', 2);

			timeStart('render modules', 2);

			// We need to create addons before prerender because at the moment, there
			// can be no async code between prerender and render due to internal state
			const addons = await createAddons(this.outputOptions, this.pluginDriver);
			this.prerenderChunks(chunks, inputBase);
			timeEnd('render modules', 2);

			await this.addFinalizedChunksToBundle(chunks, inputBase, addons, outputBundle);
		} catch (error) {
			await this.pluginDriver.hookParallel('renderError', [error]);
			throw error;
		}
		await this.pluginDriver.hookSeq('generateBundle', [
			this.outputOptions,
			outputBundle as OutputBundle,
			isWrite
		]);
		this.finaliseAssets(outputBundle);

		timeEnd('GENERATE', 1);
		return outputBundle as OutputBundle;
	}

	private async addFinalizedChunksToBundle(
		chunks: Chunk[],
		inputBase: string,
		addons: Addons,
		outputBundle: OutputBundleWithPlaceholders
	): Promise<void> {
		this.assignChunkIds(chunks, inputBase, addons, outputBundle);
		for (const chunk of chunks) {
			const chunkDescription = (outputBundle[
				chunk.id!
			] = chunk.getPrerenderedChunk() as OutputChunk);
			chunkDescription.fileName = chunk.id!;
		}
		await Promise.all(
			chunks.map(chunk => {
				const outputChunk = outputBundle[chunk.id!] as OutputChunk;
				return chunk
					.render(this.outputOptions, addons, outputChunk, this.pluginDriver)
					.then(rendered => {
						outputChunk.code = rendered.code;
						outputChunk.map = rendered.map;
					});
			})
		);
	}

	private async addManualChunks(
		manualChunks: Record<string, string[]>
	): Promise<Map<Module, string>> {
		const manualChunkAliasByEntry = new Map<Module, string>();
		const chunkEntries = await Promise.all(
			Object.keys(manualChunks).map(async alias => ({
				alias,
				entries: await this.graph.moduleLoader.addAdditionalModules(manualChunks[alias])
			}))
		);
		for (const { alias, entries } of chunkEntries) {
			for (const entry of entries) {
				addModuleToManualChunk(alias, entry, manualChunkAliasByEntry);
			}
		}
		return manualChunkAliasByEntry;
	}

	private assignChunkIds(
		chunks: Chunk[],
		inputBase: string,
		addons: Addons,
		bundle: OutputBundleWithPlaceholders
	) {
		const entryChunks: Chunk[] = [];
		const otherChunks: Chunk[] = [];
		for (const chunk of chunks) {
			(chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint
				? entryChunks
				: otherChunks
			).push(chunk);
		}

		// make sure entry chunk names take precedence with regard to deconflicting
		const chunksForNaming: Chunk[] = entryChunks.concat(otherChunks);
		for (const chunk of chunksForNaming) {
			if (this.outputOptions.file) {
				chunk.id = basename(this.outputOptions.file);
			} else if (this.outputOptions.preserveModules) {
				chunk.id = chunk.generateIdPreserveModules(
					inputBase,
					this.outputOptions,
					bundle,
					this.unsetOptions
				);
			} else {
				chunk.id = chunk.generateId(addons, this.outputOptions, bundle, true, this.pluginDriver);
			}
			bundle[chunk.id] = FILE_PLACEHOLDER;
		}
	}

	private assignManualChunks(getManualChunk: GetManualChunk): Map<Module, string> {
		const manualChunkAliasByEntry = new Map<Module, string>();
		const manualChunksApi = {
			getModuleIds: () => this.graph.modulesById.keys(),
			getModuleInfo: this.graph.getModuleInfo
		};
		for (const module of this.graph.modulesById.values()) {
			if (module instanceof Module) {
				const manualChunkAlias = getManualChunk(module.id, manualChunksApi);
				if (typeof manualChunkAlias === 'string') {
					addModuleToManualChunk(manualChunkAlias, module, manualChunkAliasByEntry);
				}
			}
		}
		return manualChunkAliasByEntry;
	}

	private finaliseAssets(outputBundle: OutputBundleWithPlaceholders): void {
		for (const key of Object.keys(outputBundle)) {
			const file = outputBundle[key] as any;
			if (!file.type) {
				warnDeprecation(
					'A plugin is directly adding properties to the bundle object in the "generateBundle" hook. This is deprecated and will be removed in a future Rollup version, please use "this.emitFile" instead.',
					true,
					this.inputOptions
				);
				file.type = 'asset';
			}
		}
		this.pluginDriver.finaliseAssets();
	}

	private async generateChunks(): Promise<Chunk[]> {
		const { manualChunks } = this.outputOptions;
		const manualChunkAliasByEntry =
			typeof manualChunks === 'object'
				? await this.addManualChunks(manualChunks)
				: this.assignManualChunks(manualChunks);
		const chunks: Chunk[] = [];
		const chunkByModule = new Map<Module, Chunk>();
		for (const { alias, modules } of this.outputOptions.inlineDynamicImports
			? [{ alias: null, modules: getIncludedModules(this.graph.modulesById) }]
			: this.outputOptions.preserveModules
			? getIncludedModules(this.graph.modulesById).map(module => ({
					alias: null,
					modules: [module]
			  }))
			: getChunkAssignments(this.graph.entryModules, manualChunkAliasByEntry)) {
			sortByExecutionOrder(modules);
			const chunk = new Chunk(
				modules,
				this.inputOptions,
				this.outputOptions,
				this.unsetOptions,
				this.graph.modulesById,
				chunkByModule,
				this.facadeChunkByModule,
				alias
			);
			chunks.push(chunk);
			for (const module of modules) {
				chunkByModule.set(module, chunk);
			}
		}
		for (const chunk of chunks) {
			chunk.link();
		}
		const facades: Chunk[] = [];
		for (const chunk of chunks) {
			facades.push(...chunk.generateFacades());
		}
		return [...chunks, ...facades];
	}

	private prerenderChunks(chunks: Chunk[], inputBase: string): void {
		for (const chunk of chunks) {
			chunk.generateExports();
		}
		for (const chunk of chunks) {
			chunk.preRender(this.outputOptions, inputBase, this.pluginDriver);
		}
	}
}

function getAbsoluteEntryModulePaths(chunks: Chunk[]): string[] {
	const absoluteEntryModulePaths: string[] = [];
	for (const chunk of chunks) {
		for (const entryModule of chunk.entryModules) {
			if (isAbsolute(entryModule.id)) {
				absoluteEntryModulePaths.push(entryModule.id);
			}
		}
	}
	return absoluteEntryModulePaths;
}

function validateOptionsForMultiChunkOutput(outputOptions: NormalizedOutputOptions) {
	if (outputOptions.format === 'umd' || outputOptions.format === 'iife')
		return error({
			code: 'INVALID_OPTION',
			message: 'UMD and IIFE output formats are not supported for code-splitting builds.'
		});
	if (typeof outputOptions.file === 'string')
		return error({
			code: 'INVALID_OPTION',
			message:
				'When building multiple chunks, the "output.dir" option must be used, not "output.file". ' +
				'To inline dynamic imports, set the "inlineDynamicImports" option.'
		});
	if (outputOptions.sourcemapFile)
		return error({
			code: 'INVALID_OPTION',
			message: '"output.sourcemapFile" is only supported for single-file builds.'
		});
}

function getIncludedModules(modulesById: Map<string, Module | ExternalModule>): Module[] {
	return [...modulesById.values()].filter(
		module =>
			module instanceof Module &&
			(module.isIncluded() || module.isEntryPoint || module.includedDynamicImporters.length > 0)
	) as Module[];
}

function addModuleToManualChunk(
	alias: string,
	module: Module,
	manualChunkAliasByEntry: Map<Module, string>
) {
	const existingAlias = manualChunkAliasByEntry.get(module);
	if (typeof existingAlias === 'string' && existingAlias !== alias) {
		return error(errCannotAssignModuleToChunk(module.id, alias, existingAlias));
	}
	manualChunkAliasByEntry.set(module, alias);
}
