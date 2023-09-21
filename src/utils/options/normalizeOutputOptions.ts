import type {
	InternalModuleFormat,
	InteropType,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputOptions,
	SourcemapPathTransformOption
} from '../../rollup/types';
import { error, logInvalidExportOptionValue, logInvalidOption, warnDeprecation } from '../logs';
import { resolve } from '../path';
import { sanitizeFileName as defaultSanitizeFileName } from '../sanitizeFileName';
import { addTrailingSlashIfMissed, isValidUrl } from '../url';
import {
	URL_OUTPUT_AMD_BASEPATH,
	URL_OUTPUT_AMD_ID,
	URL_OUTPUT_DIR,
	URL_OUTPUT_EXTERNALIMPORTATTRIBUTES,
	URL_OUTPUT_FORMAT,
	URL_OUTPUT_GENERATEDCODE,
	URL_OUTPUT_INLINEDYNAMICIMPORTS,
	URL_OUTPUT_INTEROP,
	URL_OUTPUT_MANUALCHUNKS,
	URL_OUTPUT_SOURCEMAPBASEURL,
	URL_PRESERVEENTRYSIGNATURES
} from '../urls';
import {
	generatedCodePresets,
	getOptionWithPreset,
	normalizePluginOption,
	warnUnknownOptions
} from './options';

export async function normalizeOutputOptions(
	config: OutputOptions,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: ReadonlySet<string>
): Promise<{ options: NormalizedOutputOptions; unsetOptions: Set<string> }> {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set(unsetInputOptions);

	const compact = config.compact || false;
	const format = getFormat(config);
	const inlineDynamicImports = getInlineDynamicImports(config, inputOptions);
	const preserveModules = getPreserveModules(config, inlineDynamicImports, inputOptions);
	const file = getFile(config, preserveModules, inputOptions);
	const generatedCode = getGeneratedCode(config);
	const externalImportAttributes = getExternalImportAttributes(config, inputOptions);

	const outputOptions: NormalizedOutputOptions & OutputOptions = {
		amd: getAmd(config),
		assetFileNames: config.assetFileNames ?? 'assets/[name]-[hash][extname]',
		banner: getAddon(config, 'banner'),
		chunkFileNames: config.chunkFileNames ?? '[name]-[hash].js',
		compact,
		dir: getDir(config, file),
		dynamicImportInCjs: config.dynamicImportInCjs ?? true,
		entryFileNames: getEntryFileNames(config, unsetOptions),
		esModule: config.esModule ?? 'if-default-prop',
		experimentalMinChunkSize: config.experimentalMinChunkSize ?? 1,
		exports: getExports(config, unsetOptions),
		extend: config.extend || false,
		externalImportAssertions: externalImportAttributes,
		externalImportAttributes,
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
		interop: getInterop(config),
		intro: getAddon(config, 'intro'),
		manualChunks: getManualChunks(config, inlineDynamicImports, preserveModules),
		minifyInternalExports: getMinifyInternalExports(config, format, compact),
		name: config.name,
		noConflict: config.noConflict || false,
		outro: getAddon(config, 'outro'),
		paths: config.paths || {},
		plugins: await normalizePluginOption(config.plugins),
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
		sourcemapFileNames: getSourcemapFileNames(config, unsetOptions),
		sourcemapIgnoreList:
			typeof config.sourcemapIgnoreList === 'function'
				? config.sourcemapIgnoreList
				: config.sourcemapIgnoreList === false
				? () => false
				: relativeSourcePath => relativeSourcePath.includes('node_modules'),
		sourcemapPathTransform: config.sourcemapPathTransform as
			| SourcemapPathTransformOption
			| undefined,
		strict: config.strict ?? true,
		systemNullSetters: config.systemNullSetters ?? true,
		validate: config.validate || false
	};

	warnUnknownOptions(config, Object.keys(outputOptions), 'output options', inputOptions.onLog);
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
				logInvalidOption(
					'output.file',
					URL_OUTPUT_DIR,
					'you must set "output.dir" instead of "output.file" when using the "output.preserveModules" option'
				)
			);
		}
		if (!Array.isArray(inputOptions.input))
			return error(
				logInvalidOption(
					'output.file',
					URL_OUTPUT_DIR,
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
		case 'module': {
			return 'es';
		}
		case 'cjs':
		case 'commonjs': {
			return 'cjs';
		}
		case 'system':
		case 'systemjs': {
			return 'system';
		}
		case 'amd':
		case 'iife':
		case 'umd': {
			return configFormat;
		}
		default: {
			return error(
				logInvalidOption(
					'output.format',
					URL_OUTPUT_FORMAT,
					`Valid values are "amd", "cjs", "system", "es", "iife" or "umd"`,
					configFormat
				)
			);
		}
	}
};

const getInlineDynamicImports = (
	config: OutputOptions,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['inlineDynamicImports'] => {
	const inlineDynamicImports = config.inlineDynamicImports || false;
	const { input } = inputOptions;
	if (inlineDynamicImports && (Array.isArray(input) ? input : Object.keys(input)).length > 1) {
		return error(
			logInvalidOption(
				'output.inlineDynamicImports',
				URL_OUTPUT_INLINEDYNAMICIMPORTS,
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
	const preserveModules = config.preserveModules || false;
	if (preserveModules) {
		if (inlineDynamicImports) {
			return error(
				logInvalidOption(
					'output.inlineDynamicImports',
					URL_OUTPUT_INLINEDYNAMICIMPORTS,
					`this option is not supported for "output.preserveModules"`
				)
			);
		}
		if (inputOptions.preserveEntrySignatures === false) {
			return error(
				logInvalidOption(
					'preserveEntrySignatures',
					URL_PRESERVEENTRYSIGNATURES,
					'setting this option to false is not supported for "output.preserveModules"'
				)
			);
		}
	}
	return preserveModules;
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
			logInvalidOption(
				'output.amd.id',
				URL_OUTPUT_AMD_ID,
				'this option cannot be used together with "output.amd.autoId"/"output.amd.basePath"'
			)
		);
	}
	if (mergedOption.basePath && !mergedOption.autoId) {
		return error(
			logInvalidOption(
				'output.amd.basePath',
				URL_OUTPUT_AMD_BASEPATH,
				'this option only works with "output.amd.autoId"'
			)
		);
	}

	return mergedOption.autoId
		? {
				autoId: true,
				basePath: mergedOption.basePath,
				define: mergedOption.define,
				forceJsExtensionForImports: mergedOption.forceJsExtensionForImports
		  }
		: {
				autoId: false,
				define: mergedOption.define,
				forceJsExtensionForImports: mergedOption.forceJsExtensionForImports,
				id: mergedOption.id
		  };
};

const getAddon = <T extends 'banner' | 'footer' | 'intro' | 'outro'>(
	config: OutputOptions,
	name: T
): NormalizedOutputOptions[T] => {
	const configAddon = config[name];
	if (typeof configAddon === 'function') {
		return configAddon as NormalizedOutputOptions[T];
	}
	return () => configAddon || '';
};

// eslint-disable-next-line unicorn/prevent-abbreviations
const getDir = (
	config: OutputOptions,
	file: string | undefined
): NormalizedOutputOptions['dir'] => {
	const { dir } = config;
	if (typeof dir === 'string' && typeof file === 'string') {
		return error(
			logInvalidOption(
				'output.dir',
				URL_OUTPUT_DIR,
				'you must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks'
			)
		);
	}
	return dir;
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
		return error(logInvalidExportOptionValue(configExports));
	}
	return configExports || 'auto';
}

const getExternalImportAttributes = (
	config: OutputOptions,
	inputOptions: NormalizedInputOptions
): NormalizedOutputOptions['externalImportAttributes'] => {
	if (config.externalImportAssertions != undefined) {
		warnDeprecation(
			`The "output.externalImportAssertions" option is deprecated. Use the "output.externalImportAttributes" option instead.`,
			URL_OUTPUT_EXTERNALIMPORTATTRIBUTES,
			true,
			inputOptions
		);
	}
	return config.externalImportAttributes ?? config.externalImportAssertions ?? true;
};

const getGeneratedCode = (config: OutputOptions): NormalizedOutputOptions['generatedCode'] => {
	const configWithPreset = getOptionWithPreset(
		config.generatedCode,
		generatedCodePresets,
		'output.generatedCode',
		URL_OUTPUT_GENERATEDCODE,
		''
	);
	return {
		arrowFunctions: configWithPreset.arrowFunctions === true,
		constBindings: configWithPreset.constBindings === true,
		objectShorthand: configWithPreset.objectShorthand === true,
		reservedNamesAsProps: configWithPreset.reservedNamesAsProps !== false,
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
	'compat',
	'auto',
	'esModule',
	'default',
	'defaultOnly'
]);

const getInterop = (config: OutputOptions): NormalizedOutputOptions['interop'] => {
	const configInterop = config.interop;
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
	return configInterop === undefined ? () => 'default' : () => validateInterop(configInterop);
};

const validateInterop = (interop: InteropType): InteropType => {
	if (!ALLOWED_INTEROP_TYPES.has(interop)) {
		return error(
			logInvalidOption(
				'output.interop',
				URL_OUTPUT_INTEROP,
				// eslint-disable-next-line unicorn/prefer-spread
				`use one of ${Array.from(ALLOWED_INTEROP_TYPES, value => JSON.stringify(value)).join(
					', '
				)}`,
				interop
			)
		);
	}
	return interop;
};

const getManualChunks = (
	config: OutputOptions,
	inlineDynamicImports: boolean,
	preserveModules: boolean
): NormalizedOutputOptions['manualChunks'] => {
	const configManualChunks = config.manualChunks;
	if (configManualChunks) {
		if (inlineDynamicImports) {
			return error(
				logInvalidOption(
					'output.manualChunks',
					URL_OUTPUT_MANUALCHUNKS,
					'this option is not supported for "output.inlineDynamicImports"'
				)
			);
		}
		if (preserveModules) {
			return error(
				logInvalidOption(
					'output.manualChunks',
					URL_OUTPUT_MANUALCHUNKS,
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

const getSourcemapFileNames = (
	config: OutputOptions,
	unsetOptions: Set<string>
): NormalizedOutputOptions['sourcemapFileNames'] => {
	const configSourcemapFileNames = config.sourcemapFileNames;
	if (configSourcemapFileNames == null) {
		unsetOptions.add('sourcemapFileNames');
	}
	return configSourcemapFileNames;
};

const getSourcemapBaseUrl = (
	config: OutputOptions
): NormalizedOutputOptions['sourcemapBaseUrl'] => {
	const { sourcemapBaseUrl } = config;
	if (sourcemapBaseUrl) {
		if (isValidUrl(sourcemapBaseUrl)) {
			return addTrailingSlashIfMissed(sourcemapBaseUrl);
		}
		return error(
			logInvalidOption(
				'output.sourcemapBaseUrl',
				URL_OUTPUT_SOURCEMAPBASEURL,
				`must be a valid URL, received ${JSON.stringify(sourcemapBaseUrl)}`
			)
		);
	}
};
