import { version as rollupVersion } from 'package.json';
import Chunk from '../Chunk';
import { optimizeChunks } from '../chunk-optimization';
import Graph from '../Graph';
import { createAddons } from '../utils/addons';
import { assignChunkIds } from '../utils/assignChunkIds';
import commondir from '../utils/commondir';
import { errCannotEmitFromOptionsHook, errDeprecation, error } from '../utils/error';
import { writeFile } from '../utils/fs';
import getExportMode from '../utils/getExportMode';
import mergeOptions, { GenericConfigObject } from '../utils/mergeOptions';
import { basename, dirname, isAbsolute, resolve } from '../utils/path';
import { PluginDriver } from '../utils/PluginDriver';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from '../utils/pluginUtils';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import {
	InputOptions,
	OutputAsset,
	OutputBundle,
	OutputBundleWithPlaceholders,
	OutputChunk,
	OutputOptions,
	Plugin,
	RollupBuild,
	RollupCache,
	RollupOutput,
	RollupWatcher,
	WarningHandler
} from './types';

function checkOutputOptions(options: OutputOptions) {
	if ((options.format as string) === 'es6') {
		error(
			errDeprecation({
				message: 'The "es6" output format is deprecated – use "esm" instead',
				url: `https://rollupjs.org/guide/en/#output-format`
			})
		);
	}

	if (['amd', 'cjs', 'system', 'es', 'iife', 'umd'].indexOf(options.format as string) < 0) {
		error({
			message: `You must specify "output.format", which can be one of "amd", "cjs", "system", "esm", "iife" or "umd".`,
			url: `https://rollupjs.org/guide/en/#output-format`
		});
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

const throwAsyncGenerateError = {
	get() {
		throw new Error(`bundle.generate(...) now returns a Promise instead of a { code, map } object`);
	}
};

function applyOptionHook(inputOptions: InputOptions, plugin: Plugin) {
	if (plugin.options)
		return plugin.options.call({ meta: { rollupVersion } }, inputOptions) || inputOptions;

	return inputOptions;
}

function ensureArray<T>(items: (T | null | undefined)[] | T | null | undefined): T[] {
	if (Array.isArray(items)) {
		return items.filter(Boolean) as T[];
	}
	if (items) {
		return [items];
	}
	return [];
}

function normalizePlugins(rawPlugins: any, anonymousPrefix: string): Plugin[] {
	const plugins = ensureArray(rawPlugins);
	for (let pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
		const plugin = plugins[pluginIndex];
		if (!plugin.name) {
			plugin.name = `${anonymousPrefix}${pluginIndex + 1}`;
		}
	}
	return plugins;
}

function getInputOptions(rawInputOptions: GenericConfigObject): InputOptions {
	if (!rawInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	let { inputOptions, optionError } = mergeOptions({
		config: rawInputOptions
	});

	if (optionError)
		(inputOptions.onwarn as WarningHandler)({ message: optionError, code: 'UNKNOWN_OPTION' });

	inputOptions = ensureArray(inputOptions.plugins).reduce(applyOptionHook, inputOptions);
	inputOptions.plugins = normalizePlugins(inputOptions.plugins, ANONYMOUS_PLUGIN_PREFIX);

	if (inputOptions.inlineDynamicImports) {
		if (inputOptions.preserveModules)
			error({
				code: 'INVALID_OPTION',
				message: `"preserveModules" does not support the "inlineDynamicImports" option.`
			});
		if (inputOptions.manualChunks)
			error({
				code: 'INVALID_OPTION',
				message: '"manualChunks" option is not supported for "inlineDynamicImports".'
			});

		if (inputOptions.experimentalOptimizeChunks)
			error({
				code: 'INVALID_OPTION',
				message: '"experimentalOptimizeChunks" option is not supported for "inlineDynamicImports".'
			});
		if (
			(inputOptions.input instanceof Array && inputOptions.input.length > 1) ||
			(typeof inputOptions.input === 'object' && Object.keys(inputOptions.input).length > 1)
		)
			error({
				code: 'INVALID_OPTION',
				message: 'Multiple inputs are not supported for "inlineDynamicImports".'
			});
	} else if (inputOptions.preserveModules) {
		if (inputOptions.manualChunks)
			error({
				code: 'INVALID_OPTION',
				message: '"preserveModules" does not support the "manualChunks" option.'
			});
		if (inputOptions.experimentalOptimizeChunks)
			error({
				code: 'INVALID_OPTION',
				message: '"preserveModules" does not support the "experimentalOptimizeChunks" option.'
			});
	}

	return inputOptions;
}

let curWatcher: RollupWatcher;
export function setWatcher(watcher: RollupWatcher) {
	curWatcher = watcher;
}

function assignChunksToBundle(
	chunks: Chunk[],
	outputBundle: OutputBundleWithPlaceholders
): OutputBundle {
	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		const facadeModule = chunk.facadeModule;

		outputBundle[chunk.id as string] = {
			code: undefined as any,
			dynamicImports: chunk.getDynamicImportIds(),
			exports: chunk.getExportNames(),
			facadeModuleId: facadeModule && facadeModule.id,
			fileName: chunk.id,
			imports: chunk.getImportIds(),
			isDynamicEntry: facadeModule !== null && facadeModule.dynamicallyImportedBy.length > 0,
			isEntry: facadeModule !== null && facadeModule.isEntryPoint,
			map: undefined,
			modules: chunk.renderedModules,
			get name() {
				return chunk.getChunkName();
			},
			type: 'chunk'
		} as OutputChunk;
	}
	return outputBundle as OutputBundle;
}

export default async function rollup(rawInputOptions: GenericConfigObject): Promise<RollupBuild> {
	const inputOptions = getInputOptions(rawInputOptions);
	initialiseTimers(inputOptions);

	const graph = new Graph(inputOptions, curWatcher);
	curWatcher = undefined as any;

	// remove the cache option from the memory after graph creation (cache is not used anymore)
	const useCache = rawInputOptions.cache !== false;
	delete inputOptions.cache;
	delete rawInputOptions.cache;

	timeStart('BUILD', 1);

	let chunks: Chunk[];

	try {
		await graph.pluginDriver.hookParallel('buildStart', [inputOptions]);
		chunks = await graph.build(
			inputOptions.input as string | string[] | Record<string, string>,
			inputOptions.manualChunks,
			inputOptions.inlineDynamicImports as boolean
		);
	} catch (err) {
		const watchFiles = Object.keys(graph.watchFiles);
		if (watchFiles.length > 0) {
			err.watchFiles = watchFiles;
		}
		await graph.pluginDriver.hookParallel('buildEnd', [err]);
		throw err;
	}

	await graph.pluginDriver.hookParallel('buildEnd', []);

	timeEnd('BUILD', 1);

	// ensure we only do one optimization pass per build
	let optimized = false;

	function getOutputOptionsAndPluginDriver(
		rawOutputOptions: GenericConfigObject
	): { outputOptions: OutputOptions; outputPluginDriver: PluginDriver } {
		if (!rawOutputOptions) {
			throw new Error('You must supply an options object');
		}
		const outputPluginDriver = graph.pluginDriver.createOutputPluginDriver(
			normalizePlugins(rawOutputOptions.plugins, ANONYMOUS_OUTPUT_PLUGIN_PREFIX)
		);

		return {
			outputOptions: normalizeOutputOptions(
				inputOptions as GenericConfigObject,
				rawOutputOptions,
				chunks.length > 1,
				outputPluginDriver
			),
			outputPluginDriver
		};
	}

	async function generate(
		outputOptions: OutputOptions,
		isWrite: boolean,
		outputPluginDriver: PluginDriver
	): Promise<OutputBundle> {
		timeStart('GENERATE', 1);

		const assetFileNames = outputOptions.assetFileNames || 'assets/[name]-[hash][extname]';
		const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));
		const outputBundleWithPlaceholders: OutputBundleWithPlaceholders = Object.create(null);
		outputPluginDriver.setOutputBundle(outputBundleWithPlaceholders, assetFileNames);
		let outputBundle;

		try {
			await outputPluginDriver.hookParallel('renderStart', [outputOptions, inputOptions]);
			const addons = await createAddons(outputOptions, outputPluginDriver);
			for (const chunk of chunks) {
				if (!inputOptions.preserveModules) chunk.generateInternalExports(outputOptions);
				if (chunk.facadeModule && chunk.facadeModule.isEntryPoint)
					chunk.exportMode = getExportMode(chunk, outputOptions);
			}
			for (const chunk of chunks) {
				chunk.preRender(outputOptions, inputBase);
			}
			if (!optimized && inputOptions.experimentalOptimizeChunks) {
				optimizeChunks(chunks, outputOptions, inputOptions.chunkGroupingSize as number, inputBase);
				optimized = true;
			}
			assignChunkIds(
				chunks,
				inputOptions,
				outputOptions,
				inputBase,
				addons,
				outputBundleWithPlaceholders,
				outputPluginDriver
			);
			outputBundle = assignChunksToBundle(chunks, outputBundleWithPlaceholders);

			await Promise.all(
				chunks.map(chunk => {
					const outputChunk = outputBundleWithPlaceholders[chunk.id as string] as OutputChunk;
					return chunk
						.render(outputOptions, addons, outputChunk, outputPluginDriver)
						.then(rendered => {
							outputChunk.code = rendered.code;
							outputChunk.map = rendered.map;

							return outputPluginDriver.hookParallel('ongenerate', [
								{ bundle: outputChunk, ...outputOptions },
								outputChunk
							]);
						});
				})
			);
		} catch (error) {
			await outputPluginDriver.hookParallel('renderError', [error]);
			throw error;
		}
		await outputPluginDriver.hookSeq('generateBundle', [outputOptions, outputBundle, isWrite]);
		for (const key of Object.keys(outputBundle)) {
			const file = outputBundle[key] as any;
			if (!file.type) {
				graph.warnDeprecation(
					'A plugin is directly adding properties to the bundle object in the "generateBundle" hook. This is deprecated and will be removed in a future Rollup version, please use "this.emitFile" instead.',
					false
				);
				file.type = 'asset';
			}
		}
		outputPluginDriver.finaliseAssets();

		timeEnd('GENERATE', 1);
		return outputBundle;
	}

	const cache = useCache ? graph.getCache() : undefined;
	const result: RollupBuild = {
		cache: cache as RollupCache,
		generate: ((rawOutputOptions: GenericConfigObject) => {
			const { outputOptions, outputPluginDriver } = getOutputOptionsAndPluginDriver(
				rawOutputOptions
			);
			const promise = generate(outputOptions, false, outputPluginDriver).then(result =>
				createOutput(result)
			);
			Object.defineProperty(promise, 'code', throwAsyncGenerateError);
			Object.defineProperty(promise, 'map', throwAsyncGenerateError);
			return promise;
		}) as any,
		watchFiles: Object.keys(graph.watchFiles),
		write: ((rawOutputOptions: GenericConfigObject) => {
			const { outputOptions, outputPluginDriver } = getOutputOptionsAndPluginDriver(
				rawOutputOptions
			);
			if (!outputOptions.dir && !outputOptions.file) {
				error({
					code: 'MISSING_OPTION',
					message: 'You must specify "output.file" or "output.dir" for the build.'
				});
			}
			return generate(outputOptions, true, outputPluginDriver).then(async bundle => {
				let chunkCount = 0;
				for (const fileName of Object.keys(bundle)) {
					const file = bundle[fileName];
					if (file.type === 'asset') continue;
					chunkCount++;
					if (chunkCount > 1) break;
				}
				if (chunkCount > 1) {
					if (outputOptions.sourcemapFile)
						error({
							code: 'INVALID_OPTION',
							message: '"output.sourcemapFile" is only supported for single-file builds.'
						});
					if (typeof outputOptions.file === 'string')
						error({
							code: 'INVALID_OPTION',
							message:
								'When building multiple chunks, the "output.dir" option must be used, not "output.file".' +
								(typeof inputOptions.input !== 'string' ||
								inputOptions.inlineDynamicImports === true
									? ''
									: ' To inline dynamic imports, set the "inlineDynamicImports" option.')
						});
				}
				await Promise.all(
					Object.keys(bundle).map(chunkId =>
						writeOutputFile(result, bundle[chunkId], outputOptions, outputPluginDriver)
					)
				);
				await outputPluginDriver.hookParallel('writeBundle', [bundle]);
				return createOutput(bundle);
			});
		}) as any
	};
	if (inputOptions.perf === true) result.getTimings = getTimings;
	return result;
}

enum SortingFileType {
	ENTRY_CHUNK = 0,
	SECONDARY_CHUNK = 1,
	ASSET = 2
}

function getSortingFileType(file: OutputAsset | OutputChunk): SortingFileType {
	if (file.type === 'asset') {
		return SortingFileType.ASSET;
	}
	if (file.isEntry) {
		return SortingFileType.ENTRY_CHUNK;
	}
	return SortingFileType.SECONDARY_CHUNK;
}

function createOutput(outputBundle: Record<string, OutputChunk | OutputAsset | {}>): RollupOutput {
	return {
		output: (Object.keys(outputBundle)
			.map(fileName => outputBundle[fileName])
			.filter(outputFile => Object.keys(outputFile).length > 0) as (
			| OutputChunk
			| OutputAsset)[]).sort((outputFileA, outputFileB) => {
			const fileTypeA = getSortingFileType(outputFileA);
			const fileTypeB = getSortingFileType(outputFileB);
			if (fileTypeA === fileTypeB) return 0;
			return fileTypeA < fileTypeB ? -1 : 1;
		}) as [OutputChunk, ...(OutputChunk | OutputAsset)[]]
	};
}

function writeOutputFile(
	build: RollupBuild,
	outputFile: OutputAsset | OutputChunk,
	outputOptions: OutputOptions,
	outputPluginDriver: PluginDriver
): Promise<void> {
	const fileName = resolve(
		outputOptions.dir || dirname(outputOptions.file as string),
		outputFile.fileName
	);
	let writeSourceMapPromise: Promise<void>;
	let source: string | Buffer;
	if (outputFile.type === 'asset') {
		source = outputFile.source;
	} else {
		source = outputFile.code;
		if (outputOptions.sourcemap && outputFile.map) {
			let url: string;
			if (outputOptions.sourcemap === 'inline') {
				url = outputFile.map.toUrl();
			} else {
				url = `${basename(outputFile.fileName)}.map`;
				writeSourceMapPromise = writeFile(`${fileName}.map`, outputFile.map.toString());
			}
			if (outputOptions.sourcemap !== 'hidden') {
				source += `//# ${SOURCEMAPPING_URL}=${url}\n`;
			}
		}
	}

	return writeFile(fileName, source)
		.then(() => writeSourceMapPromise)
		.then(
			(): any =>
				outputFile.type === 'chunk' &&
				outputPluginDriver.hookSeq('onwrite', [
					{
						bundle: build,
						...outputOptions
					},
					outputFile
				])
		)
		.then(() => {});
}

function normalizeOutputOptions(
	inputOptions: GenericConfigObject,
	rawOutputOptions: GenericConfigObject,
	hasMultipleChunks: boolean,
	outputPluginDriver: PluginDriver
): OutputOptions {
	const mergedOptions = mergeOptions({
		config: {
			output: {
				...rawOutputOptions,
				...(rawOutputOptions.output as Object),
				...(inputOptions.output as Object)
			}
		}
	});

	if (mergedOptions.optionError) throw new Error(mergedOptions.optionError);

	// now outputOptions is an array, but rollup.rollup API doesn't support arrays
	const mergedOutputOptions = mergedOptions.outputOptions[0];
	const outputOptionsReducer = (outputOptions: OutputOptions, result: OutputOptions) =>
		result || outputOptions;
	const outputOptions = outputPluginDriver.hookReduceArg0Sync(
		'outputOptions',
		[mergedOutputOptions],
		outputOptionsReducer,
		pluginContext => {
			const emitError = () => pluginContext.error(errCannotEmitFromOptionsHook());
			return {
				...pluginContext,
				emitFile: emitError,
				setAssetSource: emitError
			};
		}
	);

	checkOutputOptions(outputOptions);

	if (typeof outputOptions.file === 'string') {
		if (typeof outputOptions.dir === 'string')
			error({
				code: 'INVALID_OPTION',
				message:
					'You must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks.'
			});
		if (inputOptions.preserveModules) {
			error({
				code: 'INVALID_OPTION',
				message:
					'You must set "output.dir" instead of "output.file" when using the "preserveModules" option.'
			});
		}
		if (typeof inputOptions.input === 'object' && !Array.isArray(inputOptions.input))
			error({
				code: 'INVALID_OPTION',
				message: 'You must set "output.dir" instead of "output.file" when providing named inputs.'
			});
	}

	if (hasMultipleChunks) {
		if (outputOptions.format === 'umd' || outputOptions.format === 'iife')
			error({
				code: 'INVALID_OPTION',
				message: 'UMD and IIFE output formats are not supported for code-splitting builds.'
			});
		if (typeof outputOptions.file === 'string')
			error({
				code: 'INVALID_OPTION',
				message:
					'You must set "output.dir" instead of "output.file" when generating multiple chunks.'
			});
	}

	return outputOptions;
}
