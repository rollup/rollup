import { version as rollupVersion } from 'package.json';
import Bundle from '../Bundle';
import Graph from '../Graph';
import type { PluginDriver } from '../utils/PluginDriver';
import { getSortedValidatedPlugins } from '../utils/PluginDriver';
import {
	error,
	errorAlreadyClosed,
	errorCannotEmitFromOptionsHook,
	// eslint-disable-next-line unicorn/prevent-abbreviations
	errorMissingFileOrDirOption
} from '../utils/error';
import { promises as fs } from '../utils/fs';
import { catchUnfinishedHookActions } from '../utils/hookActions';
import { normalizeInputOptions } from '../utils/options/normalizeInputOptions';
import { normalizeOutputOptions } from '../utils/options/normalizeOutputOptions';
import { normalizePluginOption } from '../utils/options/options';
import { dirname, resolve } from '../utils/path';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from '../utils/pluginUtils';
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

	const graph = new Graph(inputOptions, watcher);

	// remove the cache option from the memory after graph creation (cache is not used anymore)
	const useCache = rawInputOptions.cache !== false;
	delete inputOptions.cache;
	delete rawInputOptions.cache;

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
		async generate(rawOutputOptions: OutputOptions) {
			if (result.closed) return error(errorAlreadyClosed());

			return handleGenerateWrite(false, inputOptions, unsetInputOptions, rawOutputOptions, graph);
		},
		watchFiles: Object.keys(graph.watchFiles),
		async write(rawOutputOptions: OutputOptions) {
			if (result.closed) return error(errorAlreadyClosed());

			return handleGenerateWrite(true, inputOptions, unsetInputOptions, rawOutputOptions, graph);
		}
	};
	if (inputOptions.perf) result.getTimings = getTimings;
	return result;
}

async function getInputOptions(
	rawInputOptions: InputOptions,
	watchMode: boolean
): Promise<{ options: NormalizedInputOptions; unsetOptions: Set<string> }> {
	if (!rawInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	const rawPlugins = getSortedValidatedPlugins(
		'options',
		await normalizePluginOption(rawInputOptions.plugins)
	);
	const { options, unsetOptions } = await normalizeInputOptions(
		await rawPlugins.reduce(applyOptionHook(watchMode), Promise.resolve(rawInputOptions))
	);
	normalizePlugins(options.plugins, ANONYMOUS_PLUGIN_PREFIX);
	return { options, unsetOptions };
}

function applyOptionHook(watchMode: boolean) {
	return async (inputOptions: Promise<RollupOptions>, plugin: Plugin): Promise<InputOptions> => {
		const handler = 'handler' in plugin.options! ? plugin.options.handler : plugin.options!;
		return (
			(await handler.call({ meta: { rollupVersion, watchMode } }, await inputOptions)) ||
			inputOptions
		);
	};
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
				return error(errorMissingFileOrDirOption());
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
				const emitError = () => pluginContext.error(errorCannotEmitFromOptionsHook());
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
	await fs.mkdir(dirname(fileName), { recursive: true });

	return fs.writeFile(fileName, outputFile.type === 'asset' ? outputFile.source : outputFile.code);
}

/**
 * Auxiliary function for defining rollup configuration
 * Mainly to facilitate IDE code prompts, after all, export default does not prompt, even if you add @type annotations, it is not accurate
 * @param options
 */
export function defineConfig<T extends RollupOptions | RollupOptions[] | RollupOptionsFunction>(
	options: T
): T {
	return options;
}
