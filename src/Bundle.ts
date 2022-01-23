import Chunk from './Chunk';
import ExternalModule from './ExternalModule';
import Graph from './Graph';
import Module from './Module';
import {
	GetManualChunk,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputAsset,
	OutputBundle,
	OutputBundleWithPlaceholders,
	OutputChunk,
	WarningHandler
} from './rollup/types';
import { FILE_PLACEHOLDER } from './utils/FileEmitter';
import { PluginDriver } from './utils/PluginDriver';
import { Addons, createAddons } from './utils/addons';
import { getChunkAssignments } from './utils/chunkAssignment';
import commondir from './utils/commondir';
import {
	errCannotAssignModuleToChunk,
	errChunkInvalid,
	errInvalidOption,
	error,
	warnDeprecation
} from './utils/error';
import { sortByExecutionOrder } from './utils/executionOrder';
import { GenerateCodeSnippets, getGenerateCodeSnippets } from './utils/generateCodeSnippets';
import { basename, isAbsolute } from './utils/path';
import { timeEnd, timeStart } from './utils/timers';

export default class Bundle {
	private readonly facadeChunkByModule = new Map<Module, Chunk>();
	private readonly includedNamespaces = new Set<Module>();

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
		this.pluginDriver.setOutputBundle(outputBundle, this.outputOptions, this.facadeChunkByModule);
		try {
			await this.pluginDriver.hookParallel('renderStart', [this.outputOptions, this.inputOptions]);

			timeStart('generate chunks', 2);
			const chunks = await this.generateChunks();
			if (chunks.length > 1) {
				validateOptionsForMultiChunkOutput(this.outputOptions, this.inputOptions.onwarn);
			}
			const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));
			timeEnd('generate chunks', 2);

			timeStart('render modules', 2);

			// We need to create addons before prerender because at the moment, there
			// can be no async code between prerender and render due to internal state
			const addons = await createAddons(this.outputOptions, this.pluginDriver);
			const snippets = getGenerateCodeSnippets(this.outputOptions);
			this.prerenderChunks(chunks, inputBase, snippets);
			timeEnd('render modules', 2);

			await this.addFinalizedChunksToBundle(chunks, inputBase, addons, outputBundle, snippets);
		} catch (err: any) {
			await this.pluginDriver.hookParallel('renderError', [err]);
			throw err;
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
		chunks: readonly Chunk[],
		inputBase: string,
		addons: Addons,
		outputBundle: OutputBundleWithPlaceholders,
		snippets: GenerateCodeSnippets
	): Promise<void> {
		this.assignChunkIds(chunks, inputBase, addons, outputBundle);
		for (const chunk of chunks) {
			outputBundle[chunk.id!] = chunk.getChunkInfoWithFileNames() as OutputChunk;
		}
		await Promise.all(
			chunks.map(async chunk => {
				const outputChunk = outputBundle[chunk.id!] as OutputChunk;
				Object.assign(
					outputChunk,
					await chunk.render(this.outputOptions, addons, outputChunk, snippets)
				);
			})
		);
	}

	private async addManualChunks(
		manualChunks: Record<string, string[]>
	): Promise<Map<Module, string>> {
		const manualChunkAliasByEntry = new Map<Module, string>();
		const chunkEntries = await Promise.all(
			Object.entries(manualChunks).map(async ([alias, files]) => ({
				alias,
				entries: await this.graph.moduleLoader.addAdditionalModules(files)
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
		chunks: readonly Chunk[],
		inputBase: string,
		addons: Addons,
		bundle: OutputBundleWithPlaceholders
	): void {
		const entryChunks: Chunk[] = [];
		const otherChunks: Chunk[] = [];
		for (const chunk of chunks) {
			(chunk.facadeModule && chunk.facadeModule.isUserDefinedEntryPoint
				? entryChunks
				: otherChunks
			).push(chunk);
		}

		// make sure entry chunk names take precedence with regard to deconflicting
		const chunksForNaming = entryChunks.concat(otherChunks);
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
				chunk.id = chunk.generateId(addons, this.outputOptions, bundle, true);
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
		for (const file of Object.values(outputBundle)) {
			if (!file.type) {
				warnDeprecation(
					'A plugin is directly adding properties to the bundle object in the "generateBundle" hook. This is deprecated and will be removed in a future Rollup version, please use "this.emitFile" instead.',
					true,
					this.inputOptions
				);
				(file as OutputAsset).type = 'asset';
			}
			if (this.outputOptions.validate && typeof (file as OutputChunk).code == 'string') {
				try {
					this.graph.contextParse((file as OutputChunk).code, {
						allowHashBang: true,
						ecmaVersion: 'latest'
					});
				} catch (err: any) {
					this.inputOptions.onwarn(errChunkInvalid(file as OutputChunk, err));
				}
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
				this.pluginDriver,
				this.graph.modulesById,
				chunkByModule,
				this.facadeChunkByModule,
				this.includedNamespaces,
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

	private prerenderChunks(
		chunks: readonly Chunk[],
		inputBase: string,
		snippets: GenerateCodeSnippets
	): void {
		for (const chunk of chunks) {
			chunk.generateExports();
		}
		for (const chunk of chunks) {
			chunk.preRender(this.outputOptions, inputBase, snippets);
		}
	}
}

function getAbsoluteEntryModulePaths(chunks: readonly Chunk[]): string[] {
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

function validateOptionsForMultiChunkOutput(
	outputOptions: NormalizedOutputOptions,
	onWarn: WarningHandler
) {
	if (outputOptions.format === 'umd' || outputOptions.format === 'iife')
		return error(
			errInvalidOption(
				'output.format',
				'outputformat',
				'UMD and IIFE output formats are not supported for code-splitting builds',
				outputOptions.format
			)
		);
	if (typeof outputOptions.file === 'string')
		return error(
			errInvalidOption(
				'output.file',
				'outputdir',
				'when building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option'
			)
		);
	if (outputOptions.sourcemapFile)
		return error(
			errInvalidOption(
				'output.sourcemapFile',
				'outputsourcemapfile',
				'"output.sourcemapFile" is only supported for single-file builds'
			)
		);
	if (!outputOptions.amd.autoId && outputOptions.amd.id)
		onWarn(
			errInvalidOption(
				'output.amd.id',
				'outputamd',
				'this option is only properly supported for single-file builds. Use "output.amd.autoId" and "output.amd.basePath" instead'
			)
		);
}

function getIncludedModules(modulesById: Map<string, Module | ExternalModule>): Module[] {
	return [...modulesById.values()].filter(
		(module): module is Module =>
			module instanceof Module &&
			(module.isIncluded() || module.info.isEntry || module.includedDynamicImporters.length > 0)
	);
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
