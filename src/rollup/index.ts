import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import { basename, resolve, dirname } from '../utils/path';
import { writeFile } from '../utils/fs';
import error from '../utils/error';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import mergeOptions, { GenericConfigObject } from '../utils/mergeOptions';
import { Deprecation } from '../utils/deprecateOptions';
import Graph from '../Graph';
import ensureArray from '../utils/ensureArray';
import { createAddons } from '../utils/addons';
import commondir from '../utils/commondir';
import { optimizeChunks } from '../chunk-optimization';

import {
	WarningHandler,
	InputOptions,
	OutputOptions,
	Plugin,
	OutputChunk,
	OutputBundle,
	OutputFile,
	RollupSingleFileBuild,
	RollupBuild
} from './types';
import getExportMode from '../utils/getExportMode';
import Chunk from '../Chunk';
import { finaliseAsset, createAssetPluginHooks } from '../utils/assetHooks';

export const VERSION = '<@VERSION@>';

function addDeprecations(deprecations: Deprecation[], warn: WarningHandler) {
	const message = `The following options have been renamed — please update your config: ${deprecations
		.map(option => `${option.old} -> ${option.new}`)
		.join(', ')}`;
	warn({
		code: 'DEPRECATED_OPTIONS',
		message,
		deprecations
	});
}

function checkInputOptions(options: InputOptions) {
	if (options.transform || options.load || options.resolveId || options.resolveExternal) {
		throw new Error(
			'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details'
		);
	}
}

function checkOutputOptions(options: OutputOptions) {
	if (options.format === 'es6') {
		error({
			message: 'The `es6` output format is deprecated – use `es` instead',
			url: `https://rollupjs.org/#format-f-output-format-`
		});
	}

	if (!options.format) {
		error({
			message: `You must specify options.format, which can be one of 'amd', 'cjs', 'system', 'esm', 'iife' or 'umd'`,
			url: `https://rollupjs.org/#format-f-output-format-`
		});
	}

	if (options.moduleId) {
		if (options.amd) throw new Error('Cannot have both options.amd and options.moduleId');
	}
}

const throwAsyncGenerateError = {
	get() {
		throw new Error(`bundle.generate(...) now returns a Promise instead of a { code, map } object`);
	}
};

function applyOptionHook(inputOptions: InputOptions, plugin: Plugin) {
	if (plugin.options) return plugin.options(inputOptions) || inputOptions;
	return inputOptions;
}

function applyBuildStartHook(graph: Graph) {
	return Promise.all(
		graph.plugins.map(plugin => plugin.buildStart && plugin.buildStart.call(graph.pluginContext))
	).then(() => {});
}

function applyBuildEndHook(graph: Graph, err?: any) {
	return Promise.all(
		graph.plugins.map(plugin => plugin.buildEnd && plugin.buildEnd.call(graph.pluginContext, err))
	).then(() => {});
}

function getInputOptions(rawInputOptions: GenericConfigObject): any {
	if (!rawInputOptions) {
		throw new Error('You must supply an options object to rollup');
	}
	const { inputOptions, deprecations, optionError } = mergeOptions({
		config: rawInputOptions,
		deprecateConfig: { input: true }
	});

	if (optionError) inputOptions.onwarn({ message: optionError, code: 'UNKNOWN_OPTION' });
	if (deprecations.length) addDeprecations(deprecations, inputOptions.onwarn);

	checkInputOptions(inputOptions);
	inputOptions.plugins = ensureArray(inputOptions.plugins);
	return inputOptions.plugins.reduce(applyOptionHook, inputOptions);
}

export default function rollup(
	rawInputOptions: GenericConfigObject
): Promise<RollupSingleFileBuild | RollupBuild> {
	try {
		const inputOptions = getInputOptions(rawInputOptions);
		initialiseTimers(inputOptions);
		const graph = new Graph(inputOptions);

		timeStart('BUILD', 1);

		return applyBuildStartHook(graph)
			.then(() => {
				return graph.build(
					inputOptions.input,
					inputOptions.manualChunks,
					inputOptions.inlineDynamicImports,
					inputOptions.experimentalPreserveModules
				);
			})
			.catch(err => {
				return applyBuildEndHook(graph, err).then(() => {
					throw err;
				});
			})
			.then(chunks => {
				return applyBuildEndHook(graph).then(() => {
					return chunks;
				});
			})
			.then(chunks => {
				timeEnd('BUILD', 1);

				// TODO: deprecate legacy single chunk return
				let singleChunk: Chunk | void;
				const singleInput =
					typeof inputOptions.input === 'string' ||
					(inputOptions.input instanceof Array && inputOptions.input.length === 1);
				//let imports: string[], exports: string[];
				if (!inputOptions.experimentalPreserveModules) {
					if (singleInput) {
						for (let chunk of chunks) {
							if (chunk.entryModule === undefined) continue;
							if (singleChunk) {
								singleChunk = undefined;
								break;
							}
							singleChunk = chunk;
						}
					}
				}

				// ensure we only do one optimization pass per build
				let optimized = false;

				function generate(rawOutputOptions: GenericConfigObject, isWrite: boolean) {
					const outputOptions = normalizeOutputOptions(inputOptions, rawOutputOptions);

					if (inputOptions.experimentalCodeSplitting) {
						if (typeof outputOptions.file === 'string' && typeof outputOptions.dir === 'string')
							error({
								code: 'INVALID_OPTION',
								message:
									'Build must set either output.file for a single-file build or output.dir when generating multiple chunks.'
							});
						if (chunks.length > 1) {
							if (outputOptions.format === 'umd' || outputOptions.format === 'iife')
								error({
									code: 'INVALID_OPTION',
									message:
										'UMD and IIFE output formats are not supported with the experimentalCodeSplitting option.'
								});

							if (outputOptions.sourcemapFile)
								error({
									code: 'INVALID_OPTION',
									message: '"sourcemapFile" is only supported for single-file builds.'
								});
						}
						if (!singleChunk && typeof outputOptions.file === 'string')
							error({
								code: 'INVALID_OPTION',
								message: singleInput
									? 'When building a bundle using dynamic imports, the output.dir option must be used, not output.file. Alternatively set inlineDynamicImports: true to output a single file.'
									: 'When building multiple entry point inputs, the output.dir option must be used, not output.file.'
							});
					}

					if (!outputOptions.file && inputOptions.experimentalCodeSplitting)
						singleChunk = undefined;

					timeStart('GENERATE', 1);

					// populate asset files into output
					const assetFileNames = outputOptions.assetFileNames || 'assets/[name]-[hash][extname]';
					const outputBundle: OutputBundle = graph.finaliseAssets(assetFileNames);

					const inputBase = commondir(
						chunks.filter(chunk => chunk.entryModule).map(chunk => chunk.entryModule.id)
					);

					return createAddons(graph, outputOptions)
						.then(addons => {
							// pre-render all chunks
							for (let chunk of chunks) {
								if (!inputOptions.experimentalPreserveModules)
									chunk.generateInternalExports(outputOptions);
								if (chunk.isEntryModuleFacade)
									chunk.exportMode = getExportMode(chunk, outputOptions);
							}
							for (let chunk of chunks) {
								chunk.preRender(outputOptions, inputBase);
							}
							if (!optimized && inputOptions.optimizeChunks) {
								optimizeChunks(chunks, outputOptions, inputOptions.chunkGroupingSize, inputBase);
								optimized = true;
							}

							// then name all chunks
							for (let i = 0; i < chunks.length; i++) {
								const chunk = chunks[i];
								const imports = chunk.getImportIds();
								const exports = chunk.getExportNames();
								const modules = chunk.renderedModules;

								if (chunk === singleChunk) {
									singleChunk.id = basename(
										outputOptions.file ||
											(inputOptions.input instanceof Array
												? inputOptions.input[0]
												: inputOptions.input)
									);
									const outputChunk: OutputChunk = {
										imports,
										exports,
										modules,
										code: undefined,
										map: undefined
									};
									outputBundle[singleChunk.id] = outputChunk;
								} else if (inputOptions.experimentalPreserveModules) {
									chunk.generateIdPreserveModules(inputBase);
								} else {
									let pattern, patternName;
									if (chunk.isEntryModuleFacade) {
										pattern = outputOptions.entryFileNames || '[name].js';
										patternName = 'output.entryFileNames';
									} else {
										pattern = outputOptions.chunkFileNames || '[name]-[hash].js';
										patternName = 'output.chunkFileNames';
									}
									chunk.generateId(pattern, patternName, addons, outputOptions, outputBundle);
								}
								outputBundle[chunk.id] = {
									imports,
									exports,
									modules,
									code: undefined,
									map: undefined
								};
							}

							// render chunk import statements and finalizer wrappers given known names
							return Promise.all(
								chunks.map(chunk => {
									const chunkId = chunk.id;
									return chunk.render(outputOptions, addons).then(rendered => {
										const outputChunk = <OutputChunk>outputBundle[chunkId];
										outputChunk.code = rendered.code;
										outputChunk.map = rendered.map;

										return Promise.all(
											graph.plugins
												.filter(plugin => plugin.ongenerate)
												.map(plugin =>
													plugin.ongenerate.call(
														graph.pluginContext,
														Object.assign({ bundle: outputChunk }, outputOptions),
														outputChunk
													)
												)
										);
									});
								})
							).then(() => {});
						})
						.then(() => {
							// run generateBundle hook
							const generateBundlePlugins = graph.plugins.filter(plugin => plugin.generateBundle);
							if (generateBundlePlugins.length === 0) return;

							// assets emitted during generateBundle are unique to that specific generate call
							const assets = new Map(graph.assetsById);
							const generateBundleContext = Object.assign(
								{},
								graph.pluginContext,
								createAssetPluginHooks(assets, outputBundle, assetFileNames)
							);

							return Promise.all(
								generateBundlePlugins.map(plugin =>
									plugin.generateBundle.call(
										generateBundleContext,
										outputOptions,
										outputBundle,
										isWrite
									)
								)
							).then(() => {
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

				const cache = graph.getCache();
				const result: RollupSingleFileBuild | RollupBuild = {
					cache,
					generate: <any>((rawOutputOptions: GenericConfigObject) => {
						const promise = generate(rawOutputOptions, false).then(
							result =>
								inputOptions.experimentalCodeSplitting
									? { output: result }
									: <OutputChunk>result[chunks[0].id]
						);
						Object.defineProperty(promise, 'code', throwAsyncGenerateError);
						Object.defineProperty(promise, 'map', throwAsyncGenerateError);
						return promise;
					}),
					write: <any>((outputOptions: OutputOptions) => {
						if (
							inputOptions.experimentalCodeSplitting &&
							(!outputOptions || (!outputOptions.dir && !outputOptions.file))
						) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify output.file or output.dir for the build.'
							});
						} else if (
							!inputOptions.experimentalCodeSplitting &&
							(!outputOptions || !outputOptions.file)
						) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify output.file.'
							});
						}
						return generate(outputOptions, true).then(result =>
							Promise.all(
								Object.keys(result).map(chunkId => {
									return writeOutputFile(graph, chunkId, result[chunkId], outputOptions);
								})
							).then(
								() =>
									inputOptions.experimentalCodeSplitting
										? { output: result }
										: <OutputChunk>result[chunks[0].id]
							)
						);
					})
				};
				if (!inputOptions.experimentalCodeSplitting) {
					(<any>result).imports = (<Chunk>singleChunk).getImportIds();
					(<any>result).exports = (<Chunk>singleChunk).getExportNames();
					(<any>result).modules = cache.modules;
				}
				if (inputOptions.perf === true) result.getTimings = getTimings;
				return result;
			});
	} catch (err) {
		return Promise.reject(err);
	}
}

function isOutputChunk(file: OutputFile): file is OutputChunk {
	return typeof (<OutputChunk>file).code === 'string';
}

function writeOutputFile(
	graph: Graph,
	outputFileName: string,
	outputFile: OutputFile,
	outputOptions: OutputOptions
): Promise<void> {
	const filename = resolve(outputOptions.dir || dirname(outputOptions.file), outputFileName);
	let writeSourceMapPromise: Promise<void>;
	let source: string | Buffer;
	if (isOutputChunk(outputFile)) {
		source = outputFile.code;
		if (outputOptions.sourcemap && outputFile.map) {
			let url: string;
			if (outputOptions.sourcemap === 'inline') {
				url = outputFile.map.toUrl();
			} else {
				url = `${basename(outputFileName)}.map`;
				writeSourceMapPromise = writeFile(`${filename}.map`, outputFile.map.toString());
			}
			source += `//# ${SOURCEMAPPING_URL}=${url}\n`;
		}
	} else {
		source = outputFile;
	}

	return writeFile(filename, source)
		.then(() => writeSourceMapPromise)
		.then(
			() =>
				isOutputChunk(outputFile) &&
				Promise.all(
					graph.plugins
						.filter(plugin => plugin.onwrite)
						.map(plugin =>
							plugin.onwrite.call(
								graph.pluginContext,
								Object.assign({ bundle: outputFile }, outputOptions),
								outputFile
							)
						)
				)
		)
		.then(() => {});
}

function normalizeOutputOptions(
	inputOptions: GenericConfigObject,
	rawOutputOptions: GenericConfigObject
): OutputOptions {
	if (!rawOutputOptions) {
		throw new Error('You must supply an options object');
	}
	// since deprecateOptions, adds the output properties
	// to `inputOptions` so adding that lastly
	const consolidatedOutputOptions = Object.assign(
		{},
		{
			output: Object.assign({}, rawOutputOptions, rawOutputOptions.output, inputOptions.output)
		}
	);
	const mergedOptions = mergeOptions({
		// just for backward compatiblity to fallback on root
		// if the option isn't present in `output`
		config: consolidatedOutputOptions,
		deprecateConfig: { output: true }
	});

	if (mergedOptions.optionError) throw new Error(mergedOptions.optionError);

	// now outputOptions is an array, but rollup.rollup API doesn't support arrays
	const outputOptions = mergedOptions.outputOptions[0];
	const deprecations = mergedOptions.deprecations;

	if (deprecations.length) addDeprecations(deprecations, inputOptions.onwarn);
	checkOutputOptions(outputOptions);

	return outputOptions;
}
