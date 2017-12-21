import { timeStart, timeEnd, flushTime } from '../utils/flushTime';
import { basename } from '../utils/path';
import { writeFile } from '../utils/fs';
import { assign, keys } from '../utils/object';
import { mapSequence } from '../utils/promise';
import validateKeys from '../utils/validateKeys';
import error from '../utils/error';
import { SOURCEMAPPING_URL } from '../utils/sourceMappingURL';
import mergeOptions from '../utils/mergeOptions.js';
import Bundle from '../Bundle';
import Module from '../Module';
import { RawSourceMap } from 'source-map';
import { WatchOptions } from 'chokidar';
import Program from '../ast/nodes/Program';

export const VERSION = '<@VERSION@>';

export type SourceDescription = { code: string, map?: RawSourceMap, ast?: Program };

export type ResolveIdHook = (id: string, parent: string) => Promise<string | boolean | void> | string | boolean | void;
export type IsExternalHook = (id: string, parentId: string, isResolved: boolean) => Promise<boolean | void> | boolean | void;
export type LoadHook = (id: string) => Promise<SourceDescription | string | void> | SourceDescription | string | void;
export type TransformHook = (code: string) => Promise<SourceDescription | string | void>;

export interface Plugin {
	name: string;
	options?: (options: InputOptions) => void;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	transform?: TransformHook;
	ongenerate?: (options: OutputOptions, source: SourceDescription) => void;
	onwrite?: (options: OutputOptions, source: SourceDescription) => void;

	banner?: () => string;
	footer?: () => string;
	intro?: () => string;
	outro?: () => string;
}

export interface TreeshakingOptions {
	propertyReadSideEffects: boolean;
	pureExternalModules: boolean;
}

export type ExternalOption = string[] | IsExternalHook;
export type GlobalsOption = { [name: string]: string } | ((name: string) => string);

export interface InputOptions {
	input: string;
	external?: ExternalOption;
	plugins?: Plugin[];

	onwarn?: WarningHandler;
	cache?: {
		modules: Module[];
	};

	acorn: {};
	treeshake?: boolean | TreeshakingOptions;
	context?: string;
	moduleContext?: string | ((id: string) => string) | {[id: string]: string};
	legacy?: boolean;

	pureExternalModules?: boolean;
	preferConst?: boolean;
	watch?: {
		chokidar?: boolean | WatchOptions;
    include?: string[];
    exclude?: string[];
    clearScreen?: boolean;
	};

	noConflict?: boolean;
	exports?: 'default' | 'named' | 'none';

	// deprecated
	entry?: string;
	transform?: TransformHook;
	load?: LoadHook;
	resolveId?: ResolveIdHook;
	resolveExternal?: any;

	output?: OutputOptions;
}

export type ModuleFormat = 'amd' | 'cjs' | 'es' | 'es6' | 'iife' | 'umd';

export interface OutputOptions {
	// required
	file: string;
	format: ModuleFormat;

	// optional
	amd?: {
		id?: string;
		define?: string;
	}
	name?: string;
	sourcemap?: boolean | 'inline';
	sourcemapFile?: string;

	banner?: string;
	footer?: string;
	intro?: string;
	outro?: string;
	paths?: Record<string, string> | ((id: string) => string);

	freeze?: boolean;
	exports?: string;

	strict?: boolean;
	interop?: boolean;
	extend?: boolean;
	globals?: GlobalsOption;
	indent?: string;

	// deprecated
	dest?: string;
	moduleId?: string;
}

export interface RollupWarning {
	message?: string;
	code?: string;
	loc?: {
		file: string;
		line: number;
		column: number;
	};
	deprecations?: { old: string, new: string }[];
	modules?: string[];
	names?: string[];
	source?: string;
	importer?: string;
	frame?: any;
	missing?: string;
	exporter?: string;
	name?: string;
	sources?: string[];
	reexporter?: string;
	guess?: string;
	url?: string;
	id?: string;
	plugin?: string;
	pos?: number;
	pluginCode?: string;
}

export type WarningHandler = (warning: RollupWarning) => void;

function addDeprecations (deprecations, warn) {
	const message = `The following options have been renamed — please update your config: ${deprecations.map(
		option => `${option.old} -> ${option.new}`).join(', ')}`;
	warn({
		code: 'DEPRECATED_OPTIONS',
		message,
		deprecations
	});
}

function checkInputOptions (options) {
	if (options.transform || options.load || options.resolveId || options.resolveExternal) {
		throw new Error(
			'The `transform`, `load`, `resolveId` and `resolveExternal` options are deprecated in favour of a unified plugin API. See https://github.com/rollup/rollup/wiki/Plugins for details'
		);
	}
}

function checkOutputOptions (options) {
	if (options.format === 'es6') {
		error({
			message: 'The `es6` output format is deprecated – use `es` instead',
			url: `https://rollupjs.org/#format-f-output-format-`
		});
	}

	if (!options.format) {
		error({
			message: `You must specify options.format, which can be one of 'amd', 'cjs', 'es', 'iife' or 'umd'`,
			url: `https://rollupjs.org/#format-f-output-format-`
		});
	}

	if (options.moduleId) {
		if (options.amd) throw new Error('Cannot have both options.amd and options.moduleId');
	}
}

const throwAsyncGenerateError = {
	get () {
		throw new Error(
			`bundle.generate(...) now returns a Promise instead of a { code, map } object`
		);
	}
};

export default function rollup (_inputOptions: InputOptions) {
	try {
		if (!_inputOptions) {
			throw new Error('You must supply an options object to rollup');
		}
		const { inputOptions, deprecations, optionError } = mergeOptions({
			config: _inputOptions,
			deprecateConfig: { input: true },
		});

		if (optionError) throw new Error(optionError);

		if (deprecations.length) addDeprecations(deprecations, inputOptions.onwarn);
		checkInputOptions(inputOptions);
		const bundle = new Bundle(inputOptions);

		timeStart('--BUILD--');

		return bundle.build().then(() => {
			timeEnd('--BUILD--');

			function generate (_outputOptions: OutputOptions) {
				if (!_outputOptions) {
					throw new Error('You must supply an options object');
				}
				// since deprecateOptions, adds the output properties
				// to `inputOptions` so adding that lastly
				const consolidatedOutputOptions = Object.assign({}, {
					output: Object.assign({}, _outputOptions, _outputOptions.output, inputOptions.output)
				});
				const mergedOptions = mergeOptions({
					// just for backward compatiblity to fallback on root
					// if the option isn't present in `output`
					config: consolidatedOutputOptions,
					deprecateConfig: { output: true },
				});

				// check for errors
				if (mergedOptions.optionError) throw new Error(mergedOptions.optionError);

				// now outputOptions is an array, but rollup.rollup API doesn't support arrays
				const outputOptions = mergedOptions.outputOptions[0];
				const deprecations = mergedOptions.deprecations;

				if (deprecations.length) addDeprecations(deprecations, inputOptions.onwarn);
				checkOutputOptions(outputOptions);

				timeStart('--GENERATE--');

				const promise = Promise.resolve()
					.then(() => bundle.render(outputOptions))
					.then(rendered => {
						timeEnd('--GENERATE--');

						bundle.plugins.forEach(plugin => {
							if (plugin.ongenerate) {
								plugin.ongenerate(
									assign(
										{
											bundle: result
										},
										outputOptions
									),
									rendered
								);
							}
						});

						flushTime();

						return rendered;
					});

				Object.defineProperty(promise, 'code', throwAsyncGenerateError);
				Object.defineProperty(promise, 'map', throwAsyncGenerateError);

				return promise;
			}

			const result = {
				imports: bundle.externalModules.map(module => module.id),
				exports: keys(bundle.entryModule.exports),
				modules: bundle.orderedModules.map(module => module.toJSON()),

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
						return Promise.all(promises).then(() => {
							return mapSequence(
								bundle.plugins.filter(plugin => plugin.onwrite),
								(plugin: Plugin) => {
									return Promise.resolve(
										plugin.onwrite(
											assign(
												{
													bundle: result
												},
												outputOptions
											),
											result
										)
									);
								}
							);
						});
					});
				}
			};

			return result;
		});
	} catch (err) {
		return Promise.reject(err);
	}
}
