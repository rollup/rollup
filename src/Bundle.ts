import Chunk from './Chunk';
import Graph from './Graph';
import Module from './Module';
import {
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputBundle,
	OutputBundleWithPlaceholders,
	OutputChunk
} from './rollup/types';
import { Addons, createAddons } from './utils/addons';
import commondir from './utils/commondir';
import { error, warnDeprecation } from './utils/error';
import { FILE_PLACEHOLDER } from './utils/FileEmitter';
import { basename, isAbsolute } from './utils/path';
import { PluginDriver } from './utils/PluginDriver';
import { timeEnd, timeStart } from './utils/timers';

export default class Bundle {
	constructor(
		private readonly outputOptions: NormalizedOutputOptions,
		private readonly unsetOptions: Set<string>,
		private readonly inputOptions: NormalizedInputOptions,
		private readonly pluginDriver: PluginDriver,
		private readonly graph: Graph // TODO Lukas replace with used properties
	) {}

	// TODO Lukas make this one nicer by structuring it
	async generate(isWrite: boolean): Promise<OutputBundle> {
		timeStart('GENERATE', 1);
		const outputBundle: OutputBundleWithPlaceholders = Object.create(null);
		const facadeChunkByModule = new Map<Module, Chunk>();
		// TODO Lukas this can only be done once we have chunks due to facadeChunkByModule at the moment
		// Better: test not getting the file name in renderStart and put a ?.id in getChunkFileName
		this.pluginDriver.setOutputBundle(
			outputBundle,
			this.outputOptions.assetFileNames,
			facadeChunkByModule
		);
		try {
			await this.pluginDriver.hookParallel('renderStart', [this.outputOptions, this.inputOptions]);

			timeStart('generate chunks', 2);
			// TODO Lukas move to this class
			const chunks = this.graph.generateChunks(facadeChunkByModule);
			timeEnd('generate chunks', 2);

			if (chunks.length > 1) {
				validateOptionsForMultiChunkOutput(this.outputOptions);
			}

			const addons = await createAddons(this.outputOptions, this.pluginDriver);
			for (const chunk of chunks) {
				chunk.generateExports(this.outputOptions);
			}
			const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));
			for (const chunk of chunks) {
				chunk.preRender(this.outputOptions, inputBase, this.pluginDriver);
			}
			this.assignChunkIds(chunks, inputBase, addons, outputBundle);
			assignChunksToBundle(chunks, outputBundle);

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
		} catch (error) {
			await this.pluginDriver.hookParallel('renderError', [error]);
			throw error;
		}
		await this.pluginDriver.hookSeq('generateBundle', [
			this.outputOptions,
			outputBundle as OutputBundle,
			isWrite
		]);
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

		timeEnd('GENERATE', 1);
		return outputBundle as OutputBundle;
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
			} else if (this.inputOptions.preserveModules) {
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

function assignChunksToBundle(
	chunks: Chunk[],
	outputBundle: OutputBundleWithPlaceholders
): OutputBundle {
	for (const chunk of chunks) {
		const chunkdDescription = (outputBundle[
			chunk.id!
		] = chunk.getPrerenderedChunk() as OutputChunk);
		chunkdDescription.fileName = chunk.id!;
	}
	return outputBundle as OutputBundle;
}
