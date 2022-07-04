import type {
	InternalModuleFormat,
	InteropType,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputOptions,
	SourcemapPathTransformOption
} from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import { errInvalidExportOptionValue, errInvalidOption, error, warnDeprecation } from '../error';
import { resolve } from '../path';
import { sanitizeFileName as defaultSanitizeFileName } from '../sanitizeFileName';
import { isValidUrl } from '../url';
import {
	generatedCodePresets,
	type GenericConfigObject,
	getOptionWithPreset,
	warnUnknownOptions
} from './options';

export function normalizeOutputOptions(
	config: OutputOptions,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>
): { options: NormalizedOutputOptions; unsetOptions: Set<string> } {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set(unsetInputOptions);

	const compact = config.compact || false;
	const format = getFormat(config);
	const inlineDynamicImports = getInlineDynamicImports(config, inputOptions);
	const preserveModules = getPreserveModules(config, inlineDynamicImports, inputOptions);
	const file = getFile(config, preserveModules, inputOptions);
	const preferConst = getPreferConst(config, inputOptions);
	const generatedCode = getGeneratedCode(config, preferConst);

	const outputOptions: NormalizedOutputOptions & OutputOptions = {
		amd: getAmd(config),
		assetFileNames: config.assetFileNames ?? 'assets/[name]-[hash][extname]',
		banner: getAddon(config, 'banner'),
		chunkFileNames: config.chunkFileNames ?? '[name]-[hash].js',
		compact,
		dir: getDir(config, file),
		dynamicImportFunction: getDynamicImportFunction(config, inputOptions),
		entryFileNames: getEntryFileNames(config, unsetOptions),
		esModule: config.esModule ?? true,
		exports: getExports(config, unsetOptions),
		extend: config.extend || false,
		externalLiveBindings: config.externalLiveBindings ?? true,
		file,
		footer: getAddon(config, 'footer'),
		format,
		freeze: config.freeze ?? true,
		generatedCode,
		globals: config.globals || {},
		hoistTransitiveImports: config.hoistTransitiveImports ?? true,
		indent: getIndent(config, compact),
		inlineDynamicImports,
		interop: getInterop(config, inputOptions),
		intro: getAddon(config, 'intro'),
		manualChunks: getManualChunks(config, inlineDynamicImports, preserveModules, inputOptions),
		minifyInternalExports: getMinifyInternalExports(config, format, compact),
		name: config.name,
		namespaceToStringTag: getNamespaceToStringTag(config, generatedCode, inputOptions),
		noConflict: config.noConflict || false,
		outro: getAddon(config, 'outro'),
		paths: config.paths || {},
		plugins: ensureArray(config.plugins),
		preferConst,
		preserveModules,
		preserveModulesRoot: getPreserveModulesRoot(config),
		sanitizeFileName:
			typeof config.sanitizeFileName === 'function'
				? config.sanitizeFileName
				: config.sanitizeFileName === false
				? id => id
				: defaultSanitizeFileName,
		sourcemap: config.sourcemap || false,
		sourcemapBaseUrl: getSourcemapBaseUrl(config),
		sourcemapExcludeSources: config.sourcemapExcludeSources || false,
		sourcemapFile: config.sourcemapFile,
		sourcemapPathTransform: config.sourcemapPathTransform as
			| SourcemapPathTransformOption
			| undefined,
		strict: config.strict ?? true,
		systemNullSetters: config.systemNullSetters || false,
		validate: config.validate || false
	};

	warnUnknownOptions(
		config as GenericConfigObject,
		Object.keys(outputOptions),
		'output options',
		inputOptions.onwarn
	);
	return { options: outputOptions, unsetOptions };
}

const getFile = (
	config: OutputOptions,
	preserveModules: boolean,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['file'] => {
	const { file } = config;
	if (typeof file === 'string') {
		if (preserveModules) {
			return error(
				errInvalidOption(
					'output.file',
					'outputdir',
					'you must set "output.dir" instead of "output.file" when using the "output.preserveModules" option'
				)
			);
		}
		if (!Array.isArray(inputOptions.input))
			return error(
				errInvalidOption(
					'output.file',
					'outputdir',
					'you must set "output.dir" instead of "output.file" when providing named inputs'
				)
			);
	}
	return file;
};

const getFormat = (config: OutputOptions): NormalizedOutputOptions['format'] => {
	const configFormat = config.format;
	switch (configFormat) {
		case undefined:
		case 'es':
		case 'esm':
		case 'module':
			return 'es';
		case 'cjs':
		case 'commonjs':
			return 'cjs';
		case 'system':
		case 'systemjs':
			return 'system';
		case 'amd':
		case 'iife':
		case 'umd':
			return configFormat;
		default:
			return error({
				message: `You must specify "output.format", which can be one of "amd", "cjs", "system", "es", "iife" or "umd".`,
				url: `https://rollupjs.org/guide/en/#outputformat`
			});
	}
};

const getInlineDynamicImports = (
	config: OutputOptions,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['inlineDynamicImports'] => {
	const inlineDynamicImports =
		(config.inlineDynamicImports ?? inputOptions.inlineDynamicImports) || false;
	const { input } = inputOptions;
	if (inlineDynamicImports && (Array.isArray(input) ? input : Object.keys(input)).length > 1) {
		return error(
			errInvalidOption(
				'output.inlineDynamicImports',
				'outputinlinedynamicimports',
				'multiple inputs are not supported when "output.inlineDynamicImports" is true'
			)
		);
	}
	return inlineDynamicImports;
};

const getPreserveModules = (
	config: OutputOptions,
	inlineDynamicImports: boolean,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['preserveModules'] => {
	const preserveModules = (config.preserveModules ?? inputOptions.preserveModules) || false;
	if (preserveModules) {
		if (inlineDynamicImports) {
			return error(
				errInvalidOption(
					'output.inlineDynamicImports',
					'outputinlinedynamicimports',
					`this option is not supported for "output.preserveModules"`
				)
			);
		}
		if (inputOptions.preserveEntrySignatures === false) {
			return error(
				errInvalidOption(
					'preserveEntrySignatures',
					'preserveentrysignatures',
					'setting this option to false is not supported for "output.preserveModules"'
				)
			);
		}
	}
	return preserveModules;
};

const getPreferConst = (
	config: OutputOptions,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['preferConst'] => {
	const configPreferConst = config.preferConst;
	if (configPreferConst != null) {
		warnDeprecation(
			`The "output.preferConst" option is deprecated. Use the "output.generatedCode.constBindings" option instead.`,
			true,
			inputOptions
		);
	}
	return !!configPreferConst;
};

const getPreserveModulesRoot = (
	config: OutputOptions
): NormalizedOutputOptions['preserveModulesRoot'] => {
	const { preserveModulesRoot } = config;
	if (preserveModulesRoot === null || preserveModulesRoot === undefined) {
		return undefined;
	}
	return resolve(preserveModulesRoot);
};

const getAmd = (config: OutputOptions): NormalizedOutputOptions['amd'] => {
	const mergedOption: {
		autoId: boolean;
		basePath: string;
		define: string;
		forceJsExtensionForImports: boolean;
		id?: string;
	} = {
		autoId: false,
		basePath: '',
		define: 'define',
		forceJsExtensionForImports: false,
		...config.amd
	};

	if ((mergedOption.autoId || mergedOption.basePath) && mergedOption.id) {
		return error(
			errInvalidOption(
				'output.amd.id',
				'outputamd',
				'this option cannot be used together with "output.amd.autoId"/"output.amd.basePath"'
			)
		);
	}
	if (mergedOption.basePath && !mergedOption.autoId) {
		return error(
			errInvalidOption(
				'output.amd.basePath',
				'outputamd',
				'this option only works with "output.amd.autoId"'
			)
		);
	}

	let normalized: NormalizedOutputOptions['amd'];
	if (mergedOption.autoId) {
		normalized = {
			autoId: true,
			basePath: mergedOption.basePath,
			define: mergedOption.define,
			forceJsExtensionForImports: mergedOption.forceJsExtensionForImports
		};
	} else {
		normalized = {
			autoId: false,
			define: mergedOption.define,
			forceJsExtensionForImports: mergedOption.forceJsExtensionForImports,
			id: mergedOption.id
		};
	}
	return normalized;
};

const getAddon = (config: OutputOptions, name: string): (() => string | Promise<string>) => {
	const configAddon = (config as GenericConfigObject)[name] as
		| string
		| (() => string | Promise<string>);
	if (typeof configAddon === 'function') {
		return configAddon;
	}
	return () => configAddon || '';
};

const getDir = (
	config: OutputOptions,
	file: string | undefined
): NormalizedOutputOptions['dir'] => {
	const { dir } = config;
	if (typeof dir === 'string' && typeof file === 'string') {
		return error(
			errInvalidOption(
				'output.dir',
				'outputdir',
				'you must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks'
			)
		);
	}
	return dir;
};

const getDynamicImportFunction = (
	config: OutputOptions,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['dynamicImportFunction'] => {
	const configDynamicImportFunction = config.dynamicImportFunction;
	if (configDynamicImportFunction) {
		warnDeprecation(
			`The "output.dynamicImportFunction" option is deprecated. Use the "renderDynamicImport" plugin hook instead.`,
			true,
			inputOptions
		);
	}
	return configDynamicImportFunction;
};

const getEntryFileNames = (
	config: OutputOptions,
	unsetOptions: Set<string>
): NormalizedOutputOptions['entryFileNames'] => {
	const configEntryFileNames = config.entryFileNames;
	if (configEntryFileNames == null) {
		unsetOptions.add('entryFileNames');
	}
	return configEntryFileNames ?? '[name].js';
};

function getExports(
	config: OutputOptions,
	unsetOptions: Set<string>
): NormalizedOutputOptions['exports'] {
	const configExports = config.exports;
	if (configExports == null) {
		unsetOptions.add('exports');
	} else if (!['default', 'named', 'none', 'auto'].includes(configExports)) {
		return error(errInvalidExportOptionValue(configExports));
	}
	return configExports || 'auto';
}

const getGeneratedCode = (
	config: OutputOptions,
	preferConst: boolean
): NormalizedOutputOptions['generatedCode'] => {
	const configWithPreset = getOptionWithPreset(
		config.generatedCode,
		generatedCodePresets,
		'output.generatedCode',
		''
	);
	return {
		arrowFunctions: configWithPreset.arrowFunctions === true,
		constBindings: configWithPreset.constBindings === true || preferConst,
		objectShorthand: configWithPreset.objectShorthand === true,
		reservedNamesAsProps: configWithPreset.reservedNamesAsProps === true,
		symbols: configWithPreset.symbols === true
	};
};

const getIndent = (config: OutputOptions, compact: boolean): NormalizedOutputOptions['indent'] => {
	if (compact) {
		return '';
	}
	const configIndent = config.indent;
	return configIndent === false ? '' : configIndent ?? true;
};

const ALLOWED_INTEROP_TYPES: ReadonlySet<string | boolean> = new Set([
	'auto',
	'esModule',
	'default',
	'defaultOnly',
	true,
	false
]);

const getInterop = (
	config: OutputOptions,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['interop'] => {
	const configInterop = config.interop;
	const validatedInteropTypes = new Set<InteropType>();
	const validateInterop = (interop: InteropType): InteropType => {
		if (!validatedInteropTypes.has(interop)) {
			validatedInteropTypes.add(interop);
			if (!ALLOWED_INTEROP_TYPES.has(interop)) {
				return error(
					errInvalidOption(
						'output.interop',
						'outputinterop',
						`use one of ${Array.from(ALLOWED_INTEROP_TYPES, value => JSON.stringify(value)).join(
							', '
						)}`,
						interop
					)
				);
			}
			if (typeof interop === 'boolean') {
				warnDeprecation(
					{
						message: `The boolean value "${interop}" for the "output.interop" option is deprecated. Use ${
							interop ? '"auto"' : '"esModule", "default" or "defaultOnly"'
						} instead.`,
						url: 'https://rollupjs.org/guide/en/#outputinterop'
					},
					true,
					inputOptions
				);
			}
		}
		return interop;
	};

	if (typeof configInterop === 'function') {
		const interopPerId: { [id: string]: InteropType } = Object.create(null);
		let defaultInterop: InteropType | null = null;
		return id =>
			id === null
				? defaultInterop || validateInterop((defaultInterop = configInterop(id)))
				: id in interopPerId
				? interopPerId[id]
				: validateInterop((interopPerId[id] = configInterop(id)));
	}
	return configInterop === undefined ? () => true : () => validateInterop(configInterop);
};

const getManualChunks = (
	config: OutputOptions,
	inlineDynamicImports: boolean,
	preserveModules: boolean,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['manualChunks'] => {
	const configManualChunks = config.manualChunks || inputOptions.manualChunks;
	if (configManualChunks) {
		if (inlineDynamicImports) {
			return error(
				errInvalidOption(
					'output.manualChunks',
					'outputmanualchunks',
					'this option is not supported for "output.inlineDynamicImports"'
				)
			);
		}
		if (preserveModules) {
			return error(
				errInvalidOption(
					'output.manualChunks',
					'outputmanualchunks',
					'this option is not supported for "output.preserveModules"'
				)
			);
		}
	}
	return configManualChunks || {};
};

const getMinifyInternalExports = (
	config: OutputOptions,
	format: InternalModuleFormat,
	compact: boolean
): NormalizedOutputOptions['minifyInternalExports'] =>
	config.minifyInternalExports ?? (compact || format === 'es' || format === 'system');

const getNamespaceToStringTag = (
	config: OutputOptions,
	generatedCode: NormalizedOutputOptions['generatedCode'],
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['namespaceToStringTag'] => {
	const configNamespaceToStringTag = config.namespaceToStringTag;
	if (configNamespaceToStringTag != null) {
		warnDeprecation(
			`The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.`,
			true,
			inputOptions
		);
		return configNamespaceToStringTag;
	}
	return generatedCode.symbols || false;
};

const getSourcemapBaseUrl = (
	config: OutputOptions
): NormalizedOutputOptions['sourcemapBaseUrl'] => {
	const { sourcemapBaseUrl } = config;
	if (sourcemapBaseUrl) {
		if (isValidUrl(sourcemapBaseUrl)) {
			return sourcemapBaseUrl;
		}
		return error(
			errInvalidOption(
				'output.sourcemapBaseUrl',
				'outputsourcemapbaseurl',
				`must be a valid URL, received ${JSON.stringify(sourcemapBaseUrl)}`
			)
		);
	}
};
