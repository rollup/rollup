import { version as rollupVersion } from 'package.json';
import Bundle from '../Bundle';
import Chunk from '../Chunk';
import Graph from '../Graph';
import { errCannotEmitFromOptionsHook, error } from '../utils/error';
import { writeFile } from '../utils/fs';
import {
	ensureArray,
	GenericConfigObject,
	parseInputOptions,
	parseOutputOptions
} from '../utils/parseOptions';
import { basename, dirname, resolve } from '../utils/path';
import { PluginDriver } from '../utils/PluginDriver';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from '../utils/pluginUtils';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import {
	InputOptions,
	OutputAsset,
	OutputChunk,
	OutputOptions,
	Plugin,
	RollupBuild,
	RollupOutput,
	RollupWatcher,
	WarningHandler
} from './types';

export default function rollup(rawInputOptions: GenericConfigObject): Promise<RollupBuild> {
	return rollupInternal(rawInputOptions, null);
}

export async function rollupInternal(
	rawInputOptions: GenericConfigObject,
	watcher: RollupWatcher | null
): Promise<RollupBuild> {
	const inputOptions = getInputOptions(rawInputOptions);
	initialiseTimers(inputOptions);

	const graph = new Graph(inputOptions, watcher);

	// remove the cache option from the memory after graph creation (cache is not used anymore)
	const useCache = rawInputOptions.cache !== false;
	delete inputOptions.cache;
	delete rawInputOptions.cache;

	timeStart('BUILD', 1);

	// TODO Lukas move this variable to generate
	let chunks: Chunk[];
	try {
		await graph.pluginDriver.hookParallel('buildStart', [inputOptions]);
		chunks = await graph.build(
			inputOptions.input as string | string[] | Record<string, string>,
			inputOptions.manualChunks,
			inputOptions.inlineDynamicImports!
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

	const cache = useCache ? graph.getCache() : undefined;
	const result: RollupBuild = {
		cache: cache!,
		async generate(rawOutputOptions: OutputOptions) {
			const { outputOptions, outputPluginDriver } = getOutputOptionsAndPluginDriver(
				rawOutputOptions as GenericConfigObject,
				graph.pluginDriver,
				inputOptions as GenericConfigObject
			);
			const bundle = new Bundle(graph, outputOptions, inputOptions, outputPluginDriver, chunks);
			return createOutput(await bundle.generate(false));
		},
		watchFiles: Object.keys(graph.watchFiles),
		async write(rawOutputOptions: OutputOptions) {
			const { outputOptions, outputPluginDriver } = getOutputOptionsAndPluginDriver(
				rawOutputOptions as GenericConfigObject,
				graph.pluginDriver,
				inputOptions as GenericConfigObject
			);
			if (!outputOptions.dir && !outputOptions.file) {
				return error({
					code: 'MISSING_OPTION',
					message: 'You must specify "output.file" or "output.dir" for the build.'
				});
			}
			const bundle = new Bundle(graph, outputOptions, inputOptions, outputPluginDriver, chunks);
			const generated = await bundle.generate(true);
			await Promise.all(
				Object.keys(generated).map(chunkId => writeOutputFile(generated[chunkId], outputOptions))
			);
			await outputPluginDriver.hookParallel('writeBundle', [outputOptions, generated]);
			return createOutput(generated);
		}
	};
	if (inputOptions.perf === true) result.getTimings = getTimings;
	return result;
}

function getInputOptions(rawInputOptions: GenericConfigObject): InputOptions {
	if (!rawInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	let inputOptions = parseInputOptions(rawInputOptions);
	inputOptions = inputOptions.plugins!.reduce(applyOptionHook, inputOptions);
	inputOptions.plugins = normalizePlugins(inputOptions.plugins!, ANONYMOUS_PLUGIN_PREFIX);

	if (inputOptions.inlineDynamicImports) {
		if (inputOptions.preserveModules)
			return error({
				code: 'INVALID_OPTION',
				message: `"preserveModules" does not support the "inlineDynamicImports" option.`
			});
		if (inputOptions.manualChunks)
			return error({
				code: 'INVALID_OPTION',
				message: '"manualChunks" option is not supported for "inlineDynamicImports".'
			});
		if (
			(inputOptions.input instanceof Array && inputOptions.input.length > 1) ||
			(typeof inputOptions.input === 'object' && Object.keys(inputOptions.input).length > 1)
		)
			return error({
				code: 'INVALID_OPTION',
				message: 'Multiple inputs are not supported for "inlineDynamicImports".'
			});
	} else if (inputOptions.preserveModules) {
		if (inputOptions.manualChunks)
			return error({
				code: 'INVALID_OPTION',
				message: '"preserveModules" does not support the "manualChunks" option.'
			});
		if (inputOptions.preserveEntrySignatures === false)
			return error({
				code: 'INVALID_OPTION',
				message: '"preserveModules" does not support setting "preserveEntrySignatures" to "false".'
			});
	}

	return inputOptions;
}

function applyOptionHook(inputOptions: InputOptions, plugin: Plugin) {
	if (plugin.options)
		return plugin.options.call({ meta: { rollupVersion } }, inputOptions) || inputOptions;

	return inputOptions;
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

function getOutputOptionsAndPluginDriver(
	rawOutputOptions: GenericConfigObject,
	inputPluginDriver: PluginDriver,
	inputOptions: GenericConfigObject
): { outputOptions: OutputOptions; outputPluginDriver: PluginDriver } {
	if (!rawOutputOptions) {
		throw new Error('You must supply an options object');
	}
	const outputPluginDriver = inputPluginDriver.createOutputPluginDriver(
		normalizePlugins(rawOutputOptions.plugins, ANONYMOUS_OUTPUT_PLUGIN_PREFIX)
	);

	return {
		outputOptions: normalizeOutputOptions(inputOptions, rawOutputOptions, outputPluginDriver),
		outputPluginDriver
	};
}

function normalizeOutputOptions(
	inputOptions: GenericConfigObject,
	rawOutputOptions: GenericConfigObject,
	outputPluginDriver: PluginDriver
): OutputOptions {
	const outputOptions = parseOutputOptions(
		outputPluginDriver.hookReduceArg0Sync(
			'outputOptions',
			[rawOutputOptions.output || inputOptions.output || rawOutputOptions] as [OutputOptions],
			(outputOptions, result) => result || outputOptions,
			pluginContext => {
				const emitError = () => pluginContext.error(errCannotEmitFromOptionsHook());
				return {
					...pluginContext,
					emitFile: emitError,
					setAssetSource: emitError
				};
			}
		) as GenericConfigObject,
		inputOptions.onwarn as WarningHandler
	);

	if (typeof outputOptions.file === 'string') {
		if (typeof outputOptions.dir === 'string')
			return error({
				code: 'INVALID_OPTION',
				message:
					'You must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks.'
			});
		if (inputOptions.preserveModules) {
			return error({
				code: 'INVALID_OPTION',
				message:
					'You must set "output.dir" instead of "output.file" when using the "preserveModules" option.'
			});
		}
		if (typeof inputOptions.input === 'object' && !Array.isArray(inputOptions.input))
			return error({
				code: 'INVALID_OPTION',
				message: 'You must set "output.dir" instead of "output.file" when providing named inputs.'
			});
	}

	return outputOptions;
}

function createOutput(outputBundle: Record<string, OutputChunk | OutputAsset | {}>): RollupOutput {
	return {
		output: (Object.keys(outputBundle)
			.map(fileName => outputBundle[fileName])
			.filter(outputFile => Object.keys(outputFile).length > 0) as (
			| OutputChunk
			| OutputAsset
		)[]).sort((outputFileA, outputFileB) => {
			const fileTypeA = getSortingFileType(outputFileA);
			const fileTypeB = getSortingFileType(outputFileB);
			if (fileTypeA === fileTypeB) return 0;
			return fileTypeA < fileTypeB ? -1 : 1;
		}) as [OutputChunk, ...(OutputChunk | OutputAsset)[]]
	};
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

function writeOutputFile(
	outputFile: OutputAsset | OutputChunk,
	outputOptions: OutputOptions
): Promise<unknown> {
	const fileName = resolve(outputOptions.dir || dirname(outputOptions.file!), outputFile.fileName);
	let writeSourceMapPromise: Promise<void> | undefined;
	let source: string | Uint8Array;
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

	return Promise.all([writeFile(fileName, source), writeSourceMapPromise]);
}
