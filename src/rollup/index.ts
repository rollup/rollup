import { getTimings, initialiseTimers, timeEnd, timeStart } from '../utils/timers';
import { basename } from '../utils/path';
import { writeFile } from '../utils/fs';
import { mapSequence } from '../utils/promise';
import error from '../utils/error';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import mergeOptions, { GenericConfigObject } from '../utils/mergeOptions';
import { Deprecation } from '../utils/deprecateOptions';
import Graph from '../Graph';
import ensureArray from '../utils/ensureArray';
import { SourceMap } from 'magic-string';
import { createAddons } from '../utils/addons';
import commondir from '../utils/commondir';
import {
	WarningHandler,
	InputOptions,
	OutputOptions,
	SerializedTimings,
	Plugin,
	ModuleJSON
} from './types';

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
			message: `You must specify options.format, which can be one of 'amd', 'cjs', 'system', 'es', 'iife' or 'umd'`,
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

export interface OutputChunk {
	imports: string[];
	exports: string[];
	modules: string[];
	code: string;
	map?: SourceMap;
}

export interface Bundle {
	// TODO: consider deprecating to match code splitting
	imports: string[];
	exports: string[];
	modules: ModuleJSON[];
	cache: {
		modules: ModuleJSON[];
	};

	generate: (outputOptions: OutputOptions) => Promise<OutputChunk>;
	write: (options: OutputOptions) => Promise<OutputChunk>;
	getTimings?: () => SerializedTimings;
}

export interface BundleSet {
	cache: {
		modules: ModuleJSON[];
	};
	generate: (outputOptions: OutputOptions) => Promise<{ [chunkName: string]: OutputChunk }>;
	write: (options: OutputOptions) => Promise<{ [chunkName: string]: OutputChunk }>;
	getTimings?: () => SerializedTimings;
}

function applyOptionHook(inputOptions: InputOptions, plugin: Plugin) {
	if (plugin.options) return plugin.options(inputOptions) || inputOptions;
	return inputOptions;
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
	rawInputOptions: GenericConfigObject | InputOptions
): Promise<Bundle | BundleSet> {
	try {
		const inputOptions = getInputOptions(rawInputOptions);
		initialiseTimers(inputOptions);
		const graph = new Graph(inputOptions);

		timeStart('BUILD', 1);

		const codeSplitting =
			(inputOptions.experimentalCodeSplitting && typeof inputOptions.input !== 'string') ||
			inputOptions.experimentalPreserveModules;

		if (!codeSplitting) {
			if (inputOptions.manualChunks)
				error({
					code: 'INVALID_OPTION',
					message: '"chunks" option is only supported for code-splitting builds.'
				});

			return graph.buildSingle(inputOptions.input).then(chunk => {
				timeEnd('BUILD', 1);

				const imports = chunk.getImportIds();
				const exports = chunk.getExportNames();
				const modules = graph.getCache().modules;

				function generate(rawOutputOptions: GenericConfigObject) {
					const outputOptions = normalizeOutputOptions(inputOptions, rawOutputOptions);

					if (outputOptions.entryNames || outputOptions.chunkNames)
						error({
							code: 'INVALID_OPTION',
							message:
								'"entryNames" and "chunkNames" options are only supported for code-splitting builds.'
						});

					timeStart('GENERATE', 1);

					const promise = Promise.resolve()
						.then(() => {
							return createAddons(graph, outputOptions);
						})
						.then(addons => {
							chunk.generateInternalExports();
							chunk.preRender(outputOptions);
							return chunk.render(outputOptions, addons);
						})
						.then(rendered => {
							timeEnd('GENERATE', 1);

							const output = {
								imports,
								exports,
								modules: chunk.getModuleIds(),
								code: rendered.code,
								map: rendered.map
							};

							graph.plugins.forEach(plugin => {
								if (plugin.ongenerate) {
									plugin.ongenerate(
										Object.assign(
											{
												bundle: result
											},
											outputOptions
										),
										output
									);
								}
							});

							return output;
						});

					Object.defineProperty(promise, 'code', throwAsyncGenerateError);
					Object.defineProperty(promise, 'map', throwAsyncGenerateError);

					return promise;
				}

				const result: Bundle = {
					imports,
					exports,
					modules,

					cache: { modules },

					generate,
					write: (outputOptions: OutputOptions) => {
						if (!outputOptions || (!outputOptions.file && !outputOptions.dest)) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify output.file'
							});
						}

						return generate(outputOptions).then(result => {
							const file = outputOptions.file;
							let { code, map } = result;

							const promises = [];

							if (outputOptions.sourcemap) {
								let url;

								if (outputOptions.sourcemap === 'inline') {
									url = map.toUrl();
								} else {
									url = `${basename(file)}.map`;
									promises.push(writeFile(file + '.map', map.toString()));
								}

								code += `//# ${SOURCEMAPPING_URL}=${url}\n`;
							}

							promises.push(writeFile(file, code));
							return (
								Promise.all(promises)
									.then(() =>
										mapSequence(graph.plugins.filter(plugin => plugin.onwrite), (plugin: Plugin) =>
											Promise.resolve(
												plugin.onwrite(
													Object.assign(
														{
															bundle: result
														},
														outputOptions
													),
													result
												)
											)
										)
									)
									// ensures return isn't void[]
									.then(() => result)
							);
						});
					}
				};

				if (inputOptions.perf === true) {
					result.getTimings = getTimings;
				}
				return result;
			});
		}

		// code splitting case
		if (inputOptions.experimentalPreserveModules && typeof inputOptions.input === 'string') {
			inputOptions.input = [inputOptions.input];
		}
		if (!(Array.isArray(inputOptions.input) || typeof inputOptions.input === 'object')) {
			error({
				code: 'INVALID_OPTION',
				message: 'When code-splitting, "input" must be an array or object of entry points.'
			});
		}

		return graph
			.buildChunks(
				inputOptions.input,
				inputOptions.manualChunks,
				inputOptions.experimentalPreserveModules
			)
			.then(chunks => {
				timeEnd('BUILD', 1);

				function generate(rawOutputOptions: GenericConfigObject) {
					const outputOptions = normalizeOutputOptions(inputOptions, rawOutputOptions);

					if (typeof outputOptions.file === 'string')
						error({
							code: 'INVALID_OPTION',
							message: 'When code-splitting, the "dir" output option must be used, not "file".'
						});

					if (outputOptions.format === 'umd' || outputOptions.format === 'iife') {
						error({
							code: 'INVALID_OPTION',
							message:
								'UMD and IIFE output formats are not supported with the experimentalCodeSplitting option.'
						});
					}

					timeStart('GENERATE', 1);

					const generated: { [chunkName: string]: OutputChunk } = {};

					let preserveModulesBase: string;
					if (inputOptions.experimentalPreserveModules)
						preserveModulesBase = commondir(chunks.map(chunk => chunk.entryModule.id));
					let existingNames = Object.create(null);

					const promise = createAddons(graph, outputOptions)
						.then(addons => {
							// first pre-render all chunks
							// then name all chunks
							return (
								Promise.resolve()
									.then(() => {
										if (!inputOptions.experimentalPreserveModules) {
											const mangleExportNames =
												outputOptions.format === 'system' || outputOptions.format === 'es';
											for (let chunk of chunks) {
												chunk.generateInternalExports(mangleExportNames);
											}
										}
										for (let chunk of chunks) {
											chunk.preRender(outputOptions);
										}
										for (let chunk of chunks) {
											if (inputOptions.experimentalPreserveModules) {
												chunk.generateNamePreserveModules(preserveModulesBase);
											} else {
												let pattern;
												if (chunk.isEntryModuleFacade) {
													pattern = outputOptions.entryNames || '[alias].js';
												} else {
													pattern = outputOptions.chunkNames || '[alias]-[hash].js';
												}
												chunk.generateName(pattern, addons, outputOptions, existingNames);
											}
										}
									})
									// second render chunks given known names
									.then(() => {
										return Promise.all(
											chunks.map(chunk => {
												return chunk.render(outputOptions, addons).then(rendered => {
													const output = {
														imports: chunk.getImportIds(),
														exports: chunk.getExportNames(),
														modules: chunk.getModuleIds(),

														code: rendered.code,
														map: rendered.map
													};

													graph.plugins.forEach(plugin => {
														if (plugin.ongenerate) {
															plugin.ongenerate(Object.assign(chunk, outputOptions), output);
														}
													});

													generated[chunk.id] = output;
												});
											})
										);
									})
							);
						})
						.then(() => {
							timeEnd('GENERATE', 1);
							return generated;
						});

					Object.defineProperty(promise, 'code', throwAsyncGenerateError);
					Object.defineProperty(promise, 'map', throwAsyncGenerateError);

					return promise;
				}

				const result: BundleSet = {
					cache: graph.getCache(),
					generate,
					write(outputOptions: OutputOptions) {
						if (!outputOptions || !outputOptions.dir) {
							error({
								code: 'MISSING_OPTION',
								message: 'You must specify output.dir when code-splitting.'
							});
						}

						return generate(outputOptions).then(result => {
							const dir = outputOptions.dir;

							return Promise.all(
								Object.keys(result).map(chunkName => {
									let chunk = result[chunkName];
									let { code, map } = chunk;

									const promises = [];

									if (outputOptions.sourcemap) {
										let url;

										if (outputOptions.sourcemap === 'inline') {
											url = (<any>map).toUrl();
										} else {
											url = `${chunkName}.map`;
											promises.push(writeFile(dir + '/' + chunkName + '.map', map.toString()));
										}

										code += `//# ${SOURCEMAPPING_URL}=${url}\n`;
									}

									promises.push(writeFile(dir + '/' + chunkName, code));
									return Promise.all(promises).then(() => {
										return mapSequence(
											graph.plugins.filter(plugin => plugin.onwrite),
											(plugin: Plugin) =>
												Promise.resolve(
													plugin.onwrite(Object.assign({ bundle: chunk }, outputOptions), chunk)
												)
										);
									});
								})
							).then(() => result);
						});
					}
				};

				if (inputOptions.perf === true) {
					result.getTimings = getTimings;
				}
				return result;
			});
	} catch (err) {
		return Promise.reject(err);
	}
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
