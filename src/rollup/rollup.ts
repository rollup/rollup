import { version as rollupVersion } from 'package.json';
import Bundle from '../Bundle';
import Graph from '../Graph';
import { mkdir, writeFile } from '../utils/fs';
import { catchUnfinishedHookActions } from '../utils/hookActions';
import initWasm from '../utils/initWasm';
import { getLogger } from '../utils/logger';
import { LOGLEVEL_DEBUG, LOGLEVEL_INFO, LOGLEVEL_WARN } from '../utils/logging';
import { getLogHandler } from '../utils/logHandler';
import {
	error,
	logAlreadyClosed,
	logCannotEmitFromOptionsHook,
	logMissingFileOrDirOption,
	logPluginError
} from '../utils/logs';
import { normalizeInputOptions } from '../utils/options/normalizeInputOptions';
import { normalizeOutputOptions } from '../utils/options/normalizeOutputOptions';
import { getOnLog, normalizeLog, normalizePluginOption } from '../utils/options/options';
import { dirname, resolve } from '../utils/path';
import type { PluginDriver } from '../utils/PluginDriver';
import { getSortedValidatedPlugins } from '../utils/PluginDriver';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from '../utils/pluginNames';
import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import type {
	InputOptions,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputAsset,
	OutputBundle,
	OutputChunk,
	OutputOptions,
	Plugin,
	RollupBuild,
	RollupOptions,
	RollupOptionsFunction,
	RollupOutput,
	RollupWatcher
} from './types';

// @ts-expect-error TS2540: the polyfill of `asyncDispose`.
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export default function rollup(rawInputOptions: RollupOptions): Promise<RollupBuild> {
	return rollupInternal(rawInputOptions, null);
}

export async function rollupInternal(
	rawInputOptions: RollupOptions,
	watcher: RollupWatcher | null
): Promise<RollupBuild> {
	const { options: inputOptions, unsetOptions: unsetInputOptions } = await getInputOptions(
		rawInputOptions,
		watcher !== null
	);
	initialiseTimers(inputOptions);

	await initWasm();

	const graph = new Graph(inputOptions, watcher);

	// remove the cache object from the memory after graph creation (cache is not used anymore)
	const useCache = rawInputOptions.cache !== false;
	if (rawInputOptions.cache) {
		inputOptions.cache = undefined;
		rawInputOptions.cache = undefined;
	}

	timeStart('BUILD', 1);

	await catchUnfinishedHookActions(graph.pluginDriver, async () => {
		try {
			timeStart('initialize', 2);
			await graph.pluginDriver.hookParallel('buildStart', [inputOptions]);
			timeEnd('initialize', 2);
			await graph.build();
		} catch (error_: any) {
			const watchFiles = Object.keys(graph.watchFiles);
			if (watchFiles.length > 0) {
				error_.watchFiles = watchFiles;
			}
			await graph.pluginDriver.hookParallel('buildEnd', [error_]);
			await graph.pluginDriver.hookParallel('closeBundle', []);
			throw error_;
		}
		await graph.pluginDriver.hookParallel('buildEnd', []);
	});

	timeEnd('BUILD', 1);

	const result: RollupBuild = {
		cache: useCache ? graph.getCache() : undefined,
		async close() {
			if (result.closed) return;

			result.closed = true;

			await graph.pluginDriver.hookParallel('closeBundle', []);
		},
		closed: false,
		async [Symbol.asyncDispose]() {
			await this.close();
		},
		async generate(rawOutputOptions: OutputOptions) {
			if (result.closed) return error(logAlreadyClosed());

			return handleGenerateWrite(false, inputOptions, unsetInputOptions, rawOutputOptions, graph);
		},
		get watchFiles() {
			return Object.keys(graph.watchFiles);
		},
		async write(rawOutputOptions: OutputOptions) {
			if (result.closed) return error(logAlreadyClosed());

			return handleGenerateWrite(true, inputOptions, unsetInputOptions, rawOutputOptions, graph);
		}
	};
	if (inputOptions.perf) result.getTimings = getTimings;
	return result;
}

async function getInputOptions(
	initialInputOptions: InputOptions,
	watchMode: boolean
): Promise<{ options: NormalizedInputOptions; unsetOptions: Set<string> }> {
	if (!initialInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	const processedInputOptions = await getProcessedInputOptions(initialInputOptions, watchMode);
	const { options, unsetOptions } = await normalizeInputOptions(processedInputOptions, watchMode);
	normalizePlugins(options.plugins, ANONYMOUS_PLUGIN_PREFIX);
	return { options, unsetOptions };
}

async function getProcessedInputOptions(
	inputOptions: InputOptions,
	watchMode: boolean
): Promise<InputOptions> {
	const plugins = getSortedValidatedPlugins(
		'options',
		await normalizePluginOption(inputOptions.plugins)
	);
	const logLevel = inputOptions.logLevel || LOGLEVEL_INFO;
	const logger = getLogger(plugins, getOnLog(inputOptions, logLevel), watchMode, logLevel);

	for (const plugin of plugins) {
		const { name, options } = plugin;
		const handler = 'handler' in options! ? options.handler : options!;
		const processedOptions = await handler.call(
			{
				debug: getLogHandler(LOGLEVEL_DEBUG, 'PLUGIN_LOG', logger, name, logLevel),
				error: (error_): never =>
					error(logPluginError(normalizeLog(error_), name, { hook: 'onLog' })),
				info: getLogHandler(LOGLEVEL_INFO, 'PLUGIN_LOG', logger, name, logLevel),
				meta: { rollupVersion, watchMode },
				warn: getLogHandler(LOGLEVEL_WARN, 'PLUGIN_WARNING', logger, name, logLevel)
			},
			inputOptions
		);
		if (processedOptions) {
			inputOptions = processedOptions;
		}
	}
	return inputOptions;
}

function normalizePlugins(plugins: readonly Plugin[], anonymousPrefix: string): void {
	for (const [index, plugin] of plugins.entries()) {
		if (!plugin.name) {
			plugin.name = `${anonymousPrefix}${index + 1}`;
		}
	}
}

async function handleGenerateWrite(
	isWrite: boolean,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>,
	rawOutputOptions: OutputOptions,
	graph: Graph
): Promise<RollupOutput> {
	const {
		options: outputOptions,
		outputPluginDriver,
		unsetOptions
	} = await getOutputOptionsAndPluginDriver(
		rawOutputOptions,
		graph.pluginDriver,
		inputOptions,
		unsetInputOptions
	);
	return catchUnfinishedHookActions(outputPluginDriver, async () => {
		const bundle = new Bundle(outputOptions, unsetOptions, inputOptions, outputPluginDriver, graph);
		const generated = await bundle.generate(isWrite);
		if (isWrite) {
			timeStart('WRITE', 1);
			if (!outputOptions.dir && !outputOptions.file) {
				return error(logMissingFileOrDirOption());
			}
			await Promise.all(
				Object.values(generated).map(chunk =>
					graph.fileOperationQueue.run(() => writeOutputFile(chunk, outputOptions))
				)
			);
			await outputPluginDriver.hookParallel('writeBundle', [outputOptions, generated]);
			timeEnd('WRITE', 1);
		}
		return createOutput(generated);
	});
}

async function getOutputOptionsAndPluginDriver(
	rawOutputOptions: OutputOptions,
	inputPluginDriver: PluginDriver,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>
): Promise<{
	options: NormalizedOutputOptions;
	outputPluginDriver: PluginDriver;
	unsetOptions: Set<string>;
}> {
	if (!rawOutputOptions) {
		throw new Error('You must supply an options object');
	}
	const rawPlugins = await normalizePluginOption(rawOutputOptions.plugins);
	normalizePlugins(rawPlugins, ANONYMOUS_OUTPUT_PLUGIN_PREFIX);
	const outputPluginDriver = inputPluginDriver.createOutputPluginDriver(rawPlugins);

	return {
		...(await getOutputOptions(
			inputOptions,
			unsetInputOptions,
			rawOutputOptions,
			outputPluginDriver
		)),
		outputPluginDriver
	};
}

function getOutputOptions(
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>,
	rawOutputOptions: OutputOptions,
	outputPluginDriver: PluginDriver
): Promise<{ options: NormalizedOutputOptions; unsetOptions: Set<string> }> {
	return normalizeOutputOptions(
		outputPluginDriver.hookReduceArg0Sync(
			'outputOptions',
			[rawOutputOptions],
			(outputOptions, result) => result || outputOptions,
			pluginContext => {
				const emitError = () => pluginContext.error(logCannotEmitFromOptionsHook());
				return {
					...pluginContext,
					emitFile: emitError,
					setAssetSource: emitError
				};
			}
		),
		inputOptions,
		unsetInputOptions
	);
}

function createOutput(outputBundle: OutputBundle): RollupOutput {
	return {
		output: (
			Object.values(outputBundle).filter(outputFile => Object.keys(outputFile).length > 0) as (
				| OutputChunk
				| OutputAsset
			)[]
		).sort(
			(outputFileA, outputFileB) =>
				getSortingFileType(outputFileA) - getSortingFileType(outputFileB)
		) as [OutputChunk, ...(OutputChunk | OutputAsset)[]]
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

async function writeOutputFile(
	outputFile: OutputAsset | OutputChunk,
	outputOptions: NormalizedOutputOptions
): Promise<unknown> {
	const fileName = resolve(outputOptions.dir || dirname(outputOptions.file!), outputFile.fileName);

	// 'recursive: true' does not throw if the folder structure, or parts of it, already exist
	await mkdir(dirname(fileName), { recursive: true });

	return writeFile(fileName, outputFile.type === 'asset' ? outputFile.source : outputFile.code);
}

/**
 * Auxiliary function for defining rollup configuration
 * Mainly to facilitate IDE code prompts, after all, export default does not
 * prompt, even if you add @type annotations, it is not accurate
 * @param options
 */
export function defineConfig<T extends RollupOptions | RollupOptions[] | RollupOptionsFunction>(
	options: T
): T {
	return options;
}
