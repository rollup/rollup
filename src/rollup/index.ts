import { version as rollupVersion } from 'package.json';
import Chunk from '../Chunk';
import { optimizeChunks } from '../chunk-optimization';
import Graph from '../Graph';
import { createAddons } from '../utils/addons';
import { createAssetPluginHooks, finaliseAsset } from '../utils/assetHooks';
import { assignChunkIds } from '../utils/assignChunkIds';
import commondir from '../utils/commondir';
import { errDeprecation, error } from '../utils/error';
import { writeFile } from '../utils/fs';
import getExportMode from '../utils/getExportMode';
import mergeOptions, { GenericConfigObject } from '../utils/mergeOptions';
import { basename, dirname, isAbsolute, resolve } from '../utils/path';
import { ANONYMOUS_PLUGIN_PREFIX, PluginDriver } from '../utils/pluginDriver';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import {
	InputOptions,
	OutputAsset,
	OutputBundle,
	OutputChunk,
	OutputOptions,
	Plugin,
	PluginContext,
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
				url: `https://rollupjs.org/guide/en#output-format`
			})
		);
	}

	if (['amd', 'cjs', 'system', 'es', 'iife', 'umd'].indexOf(options.format as string) < 0) {
		error({
			message: `You must specify "output.format", which can be one of "amd", "cjs", "system", "esm", "iife" or "umd".`,
			url: `https://rollupjs.org/guide/en#output-format`
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
	inputOptions.plugins = ensureArray(inputOptions.plugins);
	for (let pluginIndex = 0; pluginIndex < inputOptions.plugins.length; pluginIndex++) {
		const plugin = inputOptions.plugins[pluginIndex];
		if (!plugin.name) {
			plugin.name = `${ANONYMOUS_PLUGIN_PREFIX}${pluginIndex + 1}`;
		}
	}

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

export default function rollup(rawInputOptions: GenericConfigObject): Promise<RollupBuild> {
	try {
		const inputOptions = getInputOptions(rawInputOptions);
		initialiseTimers(inputOptions);

		const graph = new Graph(inputOptions, curWatcher);
		curWatcher = undefined as any;

		// remove the cache option from the memory after graph creation (cache is not used anymore)
		const useCache = rawInputOptions.cache !== false;
		delete inputOptions.cache;
		delete rawInputOptions.cache;

		timeStart('BUILD', 1);

		return graph.pluginDriver
			.hookParallel('buildStart', [inputOptions])
			.then(() =>
				graph.build(
					inputOptions.input as string | string[] | Record<string, string>,
					inputOptions.manualChunks,
					inputOptions.inlineDynamicImports as boolean
				)
			)
			.then(
				chunks => graph.pluginDriver.hookParallel('buildEnd', []).then(() => chunks),
				err =>
					graph.pluginDriver.hookParallel('buildEnd', [err]).then(() => {
						throw err;
					})
			)
			.then(chunks => {
				timeEnd('BUILD', 1);

				// ensure we only do one optimization pass per build
				let optimized = false;

				function getOutputOptions(rawOutputOptions: GenericConfigObject) {
					return normalizeOutputOptions(
						inputOptions as GenericConfigObject,
						rawOutputOptions,
						chunks.length > 1,
						graph.pluginDriver
					);
				}

				function generate(outputOptions: OutputOptions, isWrite: boolean) {
					timeStart('GENERATE', 1);

					const assetFileNames = outputOptions.assetFileNames || 'assets/[name]-[hash][extname]';
					const outputBundle: OutputBundle = graph.finaliseAssets(assetFileNames);
					const inputBase = commondir(getAbsoluteEntryModulePaths(chunks));

					return graph.pluginDriver
						.hookParallel('renderStart', [])
						.then(() => createAddons(graph, outputOptions))
						.then(addons => {
							// pre-render all chunks
							for (const chunk of chunks) {
								if (!inputOptions.preserveModules) chunk.generateInternalExports(outputOptions);
								if (chunk.facadeModule && chunk.facadeModule.isEntryPoint)
									chunk.exportMode = getExportMode(chunk, outputOptions);
							}
							for (const chunk of chunks) {
								chunk.preRender(outputOptions, inputBase);
							}
							if (!optimized && inputOptions.experimentalOptimizeChunks) {
								optimizeChunks(
									chunks,
									outputOptions,
									inputOptions.chunkGroupingSize as number,
									inputBase
								);
								optimized = true;
							}

							assignChunkIds(chunks, inputOptions, outputOptions, inputBase, addons);

							// assign to outputBundle
							for (let i = 0; i < chunks.length; i++) {
								const chunk = chunks[i];
								const facadeModule = chunk.facadeModule;

								outputBundle[chunk.id] = {
									code: undefined as any,
									dynamicImports: chunk.getDynamicImportIds(),
									exports: chunk.getExportNames(),
									facadeModuleId: facadeModule && facadeModule.id,
									fileName: chunk.id,
									imports: chunk.getImportIds(),
									isDynamicEntry:
										facadeModule !== null && facadeModule.dynamicallyImportedBy.length > 0,
									isEntry: facadeModule !== null && facadeModule.isEntryPoint,
									map: undefined,
									modules: chunk.renderedModules,
									get name() {
										return chunk.getChunkName();
									}
								} as OutputChunk;
							}

							return Promise.all(
								chunks.map(chunk => {
									const outputChunk = outputBundle[chunk.id] as OutputChunk;
									return chunk.render(outputOptions, addons, outputChunk).then(rendered => {
										outputChunk.code = rendered.code;
										outputChunk.map = rendered.map;

										return graph.pluginDriver.hookParallel('ongenerate', [
											{ bundle: outputChunk, ...outputOptions },
											outputChunk
										]);
									});
								})
							).then(() => {});
						})
						.catch(error =>
							graph.pluginDriver.hookParallel('renderError', [error]).then(() => {
								throw error;
							})
						)
						.then(() => {
							// run generateBundle hook

							// assets emitted during generateBundle are unique to that specific generate call
							const assets = new Map(graph.assetsById);
							const generateAssetPluginHooks = createAssetPluginHooks(
								assets,
								outputBundle,
								assetFileNames
							);

							return graph.pluginDriver
								.hookSeq(
									'generateBundle',
									[outputOptions, outputBundle, isWrite],
									context =>
										({
											...context,
											...generateAssetPluginHooks
										} as PluginContext)
								)
								.then(() => {
									// throw errors for assets not finalised with a source
									assets.forEach(asset => {
										if (asset.fileName === undefined)
											finaliseAsset(asset, outputBundle, assetFileNames);
									});
								});
						})
						.then(() => {
							timeEnd('GENERATE', 1);
							return outputBundle;
						});
				}

				const cache = useCache ? graph.getCache() : undefined;
				const result: RollupBuild = {
					cache: cache as RollupCache,
					generate: ((rawOutputOptions: GenericConfigObject) => {
						const promise = generate(getOutputOptions(rawOutputOptions), false).then(result =>
							createOutput(result)
						);
						Object.defineProperty(promise, 'code', throwAsyncGenerateError);
						Object.defineProperty(promise, 'map', throwAsyncGenerateError);
						return promise;
					}) as any,
					watchFiles: Object.keys(graph.watchFiles),
					write: ((rawOutputOptions: GenericConfigObject) => {
						const outputOptions = getOutputOptions(rawOutputOptions);
						if (!outputOptions.dir && !outputOptions.file) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify "output.file" or "output.dir" for the build.'
							});
						}
						return generate(outputOptions, true).then(bundle => {
							let chunkCnt = 0;
							for (const fileName of Object.keys(bundle)) {
								const file = bundle[fileName];
								if ((file as OutputAsset).isAsset) continue;
								chunkCnt++;
								if (chunkCnt > 1) break;
							}
							if (chunkCnt > 1) {
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
							return Promise.all(
								Object.keys(bundle).map(chunkId =>
									writeOutputFile(graph, result, bundle[chunkId], outputOptions)
								)
							)
								.then(() => graph.pluginDriver.hookParallel('writeBundle', [bundle]))
								.then(() => createOutput(bundle));
						});
					}) as any
				};
				if (inputOptions.perf === true) result.getTimings = getTimings;
				return result;
			});
	} catch (err) {
		return Promise.reject(err);
	}
}

enum SortingFileType {
	ENTRY_CHUNK = 0,
	SECONDARY_CHUNK = 1,
	ASSET = 2
}

function getSortingFileType(file: OutputAsset | OutputChunk): SortingFileType {
	if ((file as OutputAsset).isAsset) {
		return SortingFileType.ASSET;
	}
	if ((file as OutputChunk).isEntry) {
		return SortingFileType.ENTRY_CHUNK;
	}
	return SortingFileType.SECONDARY_CHUNK;
}

function createOutput(outputBundle: Record<string, OutputChunk | OutputAsset>): RollupOutput {
	return {
		output: Object.keys(outputBundle)
			.map(fileName => outputBundle[fileName])
			.sort((outputFileA, outputFileB) => {
				const fileTypeA = getSortingFileType(outputFileA);
				const fileTypeB = getSortingFileType(outputFileB);
				if (fileTypeA === fileTypeB) return 0;
				return fileTypeA < fileTypeB ? -1 : 1;
			}) as [OutputChunk, ...(OutputChunk | OutputAsset)[]]
	};
}

function isOutputAsset(file: OutputAsset | OutputChunk): file is OutputAsset {
	return (file as OutputAsset).isAsset === true;
}

function writeOutputFile(
	graph: Graph,
	build: RollupBuild,
	outputFile: OutputAsset | OutputChunk,
	outputOptions: OutputOptions
): Promise<void> {
	const fileName = resolve(
		outputOptions.dir || dirname(outputOptions.file as string),
		outputFile.fileName
	);
	let writeSourceMapPromise: Promise<void>;
	let source: string | Buffer;
	if (isOutputAsset(outputFile)) {
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
			source += `//# ${SOURCEMAPPING_URL}=${url}\n`;
		}
	}

	return writeFile(fileName, source)
		.then(() => writeSourceMapPromise)
		.then(
			(): any =>
				!isOutputAsset(outputFile) &&
				graph.pluginDriver.hookSeq('onwrite', [
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
	pluginDriver: PluginDriver
): OutputOptions {
	if (!rawOutputOptions) {
		throw new Error('You must supply an options object');
	}
	const mergedOptions = mergeOptions({
		config: {
			output: { ...rawOutputOptions, ...rawOutputOptions.output, ...inputOptions.output }
		}
	});

	if (mergedOptions.optionError) throw new Error(mergedOptions.optionError);

	// now outputOptions is an array, but rollup.rollup API doesn't support arrays
	const mergedOutputOptions = mergedOptions.outputOptions[0];
	const outputOptionsReducer = (outputOptions: OutputOptions, result: OutputOptions) =>
		result || outputOptions;
	const outputOptions = pluginDriver.hookReduceArg0Sync(
		'outputOptions',
		[mergedOutputOptions],
		outputOptionsReducer
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
