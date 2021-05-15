import { version as rollupVersion } from 'package.json';
import Bundle from '../Bundle';
import Graph from '../Graph';
import { ensureArray } from '../utils/ensureArray';
import { errAlreadyClosed, errCannotEmitFromOptionsHook, error } from '../utils/error';
import { writeFile } from '../utils/fs';
import { normalizeInputOptions } from '../utils/options/normalizeInputOptions';
import { normalizeOutputOptions } from '../utils/options/normalizeOutputOptions';
import { GenericConfigObject } from '../utils/options/options';
import { basename, dirname, resolve } from '../utils/path';
import { PluginDriver } from '../utils/PluginDriver';
import { ANONYMOUS_OUTPUT_PLUGIN_PREFIX, ANONYMOUS_PLUGIN_PREFIX } from '../utils/pluginUtils';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import {
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputAsset,
	OutputChunk,
	OutputOptions,
	Plugin,
	RollupBuild,
	RollupOutput,
	RollupWatcher
} from './types';

export default function rollup(rawInputOptions: GenericConfigObject): Promise<RollupBuild> {
	return rollupInternal(rawInputOptions, null);
}

export async function rollupInternal(
	rawInputOptions: GenericConfigObject,
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

	try {
		await graph.pluginDriver.hookParallel('buildStart', [inputOptions]);
		await graph.build();
	} catch (err) {
		const watchFiles = Object.keys(graph.watchFiles);
		if (watchFiles.length > 0) {
			err.watchFiles = watchFiles;
		}
		await graph.pluginDriver.hookParallel('buildEnd', [err]);
		await graph.pluginDriver.hookParallel('closeBundle', []);
		throw err;
	}

	await graph.pluginDriver.hookParallel('buildEnd', []);

	timeEnd('BUILD', 1);

	const result: RollupBuild = {
		cache: useCache ? graph.getCache() : undefined,
		closed: false,
		async close() {
			if (result.closed) return;

			result.closed = true;

			await graph.pluginDriver.hookParallel('closeBundle', []);
		},
		async generate(rawOutputOptions: OutputOptions) {
			if (result.closed) return error(errAlreadyClosed());

			return handleGenerateWrite(
				false,
				inputOptions,
				unsetInputOptions,
				rawOutputOptions as GenericConfigObject,
				graph
			);
		},
		watchFiles: Object.keys(graph.watchFiles),
		async write(rawOutputOptions: OutputOptions) {
			if (result.closed) return error(errAlreadyClosed());

			return handleGenerateWrite(
				true,
				inputOptions,
				unsetInputOptions,
				rawOutputOptions as GenericConfigObject,
				graph
			);
		}
	};
	if (inputOptions.perf) result.getTimings = getTimings;
	return result;
}

async function getInputOptions(
	rawInputOptions: GenericConfigObject,
	watchMode: boolean
): Promise<{ options: NormalizedInputOptions; unsetOptions: Set<string> }> {
	if (!rawInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	const rawPlugins = ensureArray(rawInputOptions.plugins) as Plugin[];
	const { options, unsetOptions } = normalizeInputOptions(
		await rawPlugins.reduce(applyOptionHook(watchMode), Promise.resolve(rawInputOptions))
	);
	normalizePlugins(options.plugins, ANONYMOUS_PLUGIN_PREFIX);
	return { options, unsetOptions };
}

function applyOptionHook(watchMode: boolean) {
	return async (
		inputOptions: Promise<GenericConfigObject>,
		plugin: Plugin
	): Promise<GenericConfigObject> => {
		if (plugin.options) {
			return (
				((await plugin.options.call(
					{ meta: { rollupVersion, watchMode } },
					await inputOptions
				)) as GenericConfigObject) || inputOptions
			);
		}

		return inputOptions;
	};
}

function normalizePlugins(plugins: Plugin[], anonymousPrefix: string): void {
	for (let pluginIndex = 0; pluginIndex < plugins.length; pluginIndex++) {
		const plugin = plugins[pluginIndex];
		if (!plugin.name) {
			plugin.name = `${anonymousPrefix}${pluginIndex + 1}`;
		}
	}
}

async function handleGenerateWrite(
	isWrite: boolean,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: Set<string>,
	rawOutputOptions: GenericConfigObject,
	graph: Graph
): Promise<RollupOutput> {
	const {
		options: outputOptions,
		outputPluginDriver,
		unsetOptions
	} = getOutputOptionsAndPluginDriver(
		rawOutputOptions,
		graph.pluginDriver,
		inputOptions,
		unsetInputOptions
	);
	const bundle = new Bundle(outputOptions, unsetOptions, inputOptions, outputPluginDriver, graph);
	const generated = await bundle.generate(isWrite);
	if (isWrite) {
		if (!outputOptions.dir && !outputOptions.file) {
			return error({
				code: 'MISSING_OPTION',
				message: 'You must specify "output.file" or "output.dir" for the build.'
			});
		}
		await Promise.all(Object.values(generated).map(chunk => writeOutputFile(chunk, outputOptions)));
		await outputPluginDriver.hookParallel('writeBundle', [outputOptions, generated]);
	}
	return createOutput(generated);
}

function getOutputOptionsAndPluginDriver(
	rawOutputOptions: GenericConfigObject,
	inputPluginDriver: PluginDriver,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: Set<string>
): {
	options: NormalizedOutputOptions;
	outputPluginDriver: PluginDriver;
	unsetOptions: Set<string>;
} {
	if (!rawOutputOptions) {
		throw new Error('You must supply an options object');
	}
	const rawPlugins = ensureArray(rawOutputOptions.plugins) as Plugin[];
	normalizePlugins(rawPlugins, ANONYMOUS_OUTPUT_PLUGIN_PREFIX);
	const outputPluginDriver = inputPluginDriver.createOutputPluginDriver(rawPlugins);

	return {
		...getOutputOptions(inputOptions, unsetInputOptions, rawOutputOptions, outputPluginDriver),
		outputPluginDriver
	};
}

function getOutputOptions(
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: Set<string>,
	rawOutputOptions: GenericConfigObject,
	outputPluginDriver: PluginDriver
): { options: NormalizedOutputOptions; unsetOptions: Set<string> } {
	return normalizeOutputOptions(
		outputPluginDriver.hookReduceArg0Sync(
			'outputOptions',
			[rawOutputOptions.output || rawOutputOptions] as [OutputOptions],
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
		inputOptions,
		unsetInputOptions
	);
}

function createOutput(outputBundle: Record<string, OutputChunk | OutputAsset | {}>): RollupOutput {
	return {
		output: (Object.values(outputBundle).filter(
			outputFile => Object.keys(outputFile).length > 0
		) as (OutputChunk | OutputAsset)[]).sort((outputFileA, outputFileB) => {
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
	outputOptions: NormalizedOutputOptions
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
