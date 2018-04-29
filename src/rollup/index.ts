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
	Bundle,
	BundleSet,
	OutputChunk,
	OutputFiles,
	OutputAsset
} from './types';
import getExportMode from '../utils/getExportMode';

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

function applyOnbuildendHook(graph: Graph, err?: any) {
	for (let plugin of graph.plugins) {
		if (plugin.buildEnd) plugin.buildEnd.call(graph.pluginContext, err);
	}
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

export default function rollup(rawInputOptions: GenericConfigObject): Promise<Bundle | BundleSet> {
	try {
		const inputOptions = getInputOptions(rawInputOptions);
		initialiseTimers(inputOptions);
		const graph = new Graph(inputOptions);

		for (let plugin of graph.plugins) {
			if (plugin.buildStart) plugin.buildStart.call(graph.pluginContext, inputOptions);
		}

		timeStart('BUILD', 1);

		const codeSplitting =
			inputOptions.experimentalCodeSplitting || inputOptions.experimentalPreserveModules;

		// Note: when code splitting is no longer experimental,
		// inputOptions.experimentalCodeSplitting becomes inputOptions.codeSplitting
		// the following error path can then enable codeSplitting by default rather
		if (!codeSplitting && typeof inputOptions.input !== 'string')
			error({
				code: 'INVALID_OPTION',
				message: `Enable "experimentalCodeSplitting" for multiple input support.`
			});

		if (!codeSplitting) {
			if (inputOptions.manualChunks)
				error({
					code: 'INVALID_OPTION',
					message: '"manualChunks" option is only supported for code-splitting builds.'
				});

			if (inputOptions.optimizeChunks)
				error({
					code: 'INVALID_OPTION',
					message: '"optimizeChunks" option is only supported for code-splitting builds.'
				});
			if (inputOptions.input instanceof Array || typeof inputOptions.input === 'object')
				error({
					code: 'INVALID_OPTION',
					message: 'Multiple inputs are only supported for code-splitting builds.'
				});
		} else if (inputOptions.experimentalPreserveModules) {
			if (inputOptions.manualChunks)
				error({
					code: 'INVALID_OPTION',
					message: 'experimentalPreserveModules does not support the manualChunks option.'
				});
			if (inputOptions.optimizeChunks)
				error({
					code: 'INVALID_OPTION',
					message: 'experimentalPreserveModules does not support the optimizeChunks option.'
				});
		}

		return graph
			.build(
				inputOptions.input,
				inputOptions.manualChunks,
				!codeSplitting,
				inputOptions.experimentalPreserveModules
			)
			.catch(err => {
				applyOnbuildendHook(graph, err);
				throw err;
			})
			.then(chunks => {
				applyOnbuildendHook(graph);
				timeEnd('BUILD', 1);

				const singleChunk = !codeSplitting && chunks[0];

				// TODO: deprecate
				let imports, exports, modules;
				if (!codeSplitting) {
					imports = singleChunk.getImportIds();
					exports = singleChunk.getExportNames();
					modules = graph.getCache().modules;
				}

				// ensure we only do one optimization pass per build
				let optimized = false;

				function generate(rawOutputOptions: GenericConfigObject, isWrite: boolean) {
					const outputOptions = normalizeOutputOptions(inputOptions, rawOutputOptions);

					if (codeSplitting) {
						if (typeof outputOptions.file === 'string' && typeof outputOptions.dir === 'string')
							error({
								code: 'INVALID_OPTION',
								message:
									'Build must set either output.file for a single-file build or output.dir when generating multiple chunks.'
							});

						if (typeof outputOptions.file === 'string' && chunks.length > 1)
							error({
								code: 'INVALID_OPTION',
								message:
									'When generating multiple chunks, the output.dir option must be used, not output.file.'
							});

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
					} else {
						if (outputOptions.entryFileNames || outputOptions.chunkFileNames)
							error({
								code: 'INVALID_OPTION',
								message:
									'"entryNames" and "chunkNames" options are only supported for code-splitting builds.'
							});
					}

					timeStart('GENERATE', 1);

					const generated: OutputFiles = Object.create(null);

					const inputBase = commondir(
						chunks.filter(chunk => chunk.entryModule).map(chunk => chunk.entryModule.id)
					);
					let existingNames = Object.create(null);

					return (
						createAddons(graph, outputOptions)
							// first pre-render all chunks
							// then name all chunks
							.then(addons =>
								Promise.resolve()
									.then(() => {
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
										if (singleChunk) {
											singleChunk.id = basename(outputOptions.file || inputOptions.input);
										} else {
											for (let chunk of chunks) {
												if (inputOptions.experimentalPreserveModules) {
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
													chunk.generateId(
														pattern,
														patternName,
														addons,
														outputOptions,
														existingNames
													);
												}
											}
										}
									})
									// second render chunks given known names
									.then(() =>
										Promise.all(
											chunks.map(chunk => {
												return chunk.render(outputOptions, addons).then(rendered => {
													const outputChunk: OutputChunk = {
														file: chunk.id,
														isAsset: false,
														imports: (imports = chunk.getImportIds()),
														exports: (exports = chunk.getExportNames()),
														modules: (modules = chunk.getModuleIds()),

														code: rendered.code,
														map: rendered.map
													};

													generated[chunk.id] = outputChunk;

													return Promise.all(
														graph.plugins
															.filter(plugin => plugin.ongenerate)
															.map(plugin =>
																plugin.ongenerate.call(
																	graph.pluginContext,
																	outputOptions,
																	outputChunk,
																	isWrite
																)
															)
													).then(() => {});
												});
											})
										)
									)
							)
							.then(() => {
								timeEnd('GENERATE', 1);
								return generated;
							})
					);
				}

				const result: Bundle | BundleSet = {
					cache: graph.getCache(),
					generate: <any>((rawOutputOptions: GenericConfigObject) => {
						const promise = generate(rawOutputOptions, false).then(
							result => (codeSplitting ? result : <OutputChunk>result[chunks[0].id])
						);
						Object.defineProperty(promise, 'code', throwAsyncGenerateError);
						Object.defineProperty(promise, 'map', throwAsyncGenerateError);
						return promise;
					}),
					write: <any>((outputOptions: OutputOptions) => {
						if (codeSplitting && (!outputOptions || (!outputOptions.dir && !outputOptions.file))) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify output.dir when code-splitting.'
							});
						} else if (!codeSplitting && (!outputOptions || !outputOptions.file)) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify output.file.'
							});
						}
						return generate(outputOptions, true).then(result =>
							Promise.all(
								Object.keys(result).map(chunkId => {
									return writeOutputFile(graph, result[chunkId], outputOptions);
								})
							).then(() => (codeSplitting ? result : <OutputChunk>result[chunks[0].id]))
						);
					})
				};
				if (!codeSplitting) {
					(<any>result).imports = imports;
					(<any>result).exports = exports;
					(<any>result).modules = modules;
				}
				if (inputOptions.perf === true) result.getTimings = getTimings;
				return result;
			});
	} catch (err) {
		return Promise.reject(err);
	}
}

function writeOutputFile(
	graph: Graph,
	outputFile: OutputChunk | OutputAsset,
	outputOptions: OutputOptions
): Promise<void> {
	const filename = resolve(outputOptions.dir || dirname(outputOptions.file), outputFile.file);
	let writeSourceMapPromise: Promise<void>;
	let source: string | Buffer;
	if (outputFile.isAsset === false) {
		source = outputFile.code;
		if (outputOptions.sourcemap) {
			let url: string;
			if (outputOptions.sourcemap === 'inline') {
				url = outputFile.map.toUrl();
			} else {
				url = `${basename(outputFile.file)}.map`;
				writeSourceMapPromise = writeFile(`${filename}.map`, outputFile.map.toString());
			}
			source += `//# ${SOURCEMAPPING_URL}=${url}\n`;
		}
	} else {
		source = outputFile.source;
	}

	return writeFile(filename, source)
		.then(() => writeSourceMapPromise)
		.then(
			() =>
				!outputFile.isAsset &&
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
