import {
	InputOptions,
	ModuleFormat,
	OutputOptions,
	WarningHandler,
	WarningHandlerWithDefault
} from '../rollup/types';
import { errInvalidExportOptionValue, error } from './error';

export interface GenericConfigObject {
	[key: string]: unknown;
}

export interface CommandConfigObject {
	external: (string | RegExp)[];
	globals: { [id: string]: string } | undefined;
	[key: string]: unknown;
}

const createGetOption = (config: GenericConfigObject, overrides: GenericConfigObject) => (
	name: string,
	defaultValue?: unknown
): any =>
	overrides[name] !== undefined
		? overrides[name]
		: config[name] !== undefined
		? config[name]
		: defaultValue;

const normalizeObjectOptionValue = (optionValue: any) => {
	if (!optionValue) {
		return optionValue;
	}
	if (typeof optionValue !== 'object') {
		return {};
	}
	return optionValue;
};

const getObjectOption = (
	config: GenericConfigObject,
	overrides: GenericConfigObject,
	name: string
) => {
	const commandOption = normalizeObjectOptionValue(overrides[name]);
	const configOption = normalizeObjectOptionValue(config[name]);
	if (commandOption !== undefined) {
		return commandOption && { ...configOption, ...commandOption };
	}
	return configOption;
};

export function ensureArray<T>(items: (T | null | undefined)[] | T | null | undefined): T[] {
	if (Array.isArray(items)) {
		return items.filter(Boolean) as T[];
	}
	if (items) {
		return [items];
	}
	return [];
}

const defaultOnWarn: WarningHandler = warning => {
	if (typeof warning === 'string') {
		console.warn(warning);
	} else {
		console.warn(warning.message);
	}
};

const getOnWarn = (
	config: GenericConfigObject,
	defaultOnWarnHandler: WarningHandler
): WarningHandler =>
	config.onwarn
		? warning => (config.onwarn as WarningHandlerWithDefault)(warning, defaultOnWarnHandler)
		: defaultOnWarnHandler;

const getExternal = (config: GenericConfigObject, overrides: CommandConfigObject) => {
	const configExternal = config.external;
	return typeof configExternal === 'function'
		? (id: string, ...rest: string[]) =>
				configExternal(id, ...rest) || overrides.external.indexOf(id) !== -1
		: (Array.isArray(configExternal)
				? configExternal
				: configExternal
				? [configExternal]
				: []
		  ).concat(overrides.external);
};

export function parseInputOptions(
	config: GenericConfigObject,
	overrides: CommandConfigObject = { external: [], globals: undefined },
	defaultOnWarnHandler: WarningHandler = defaultOnWarn
): InputOptions {
	const getOption = createGetOption(config, overrides);
	const inputOptions: InputOptions = {
		acorn: config.acorn,
		acornInjectPlugins: config.acornInjectPlugins as any,
		cache: getOption('cache'),
		context: getOption('context'),
		experimentalCacheExpiry: getOption('experimentalCacheExpiry', 10),
		external: getExternal(config, overrides) as any,
		inlineDynamicImports: getOption('inlineDynamicImports', false),
		input: getOption('input', []),
		manualChunks: getOption('manualChunks'),
		moduleContext: config.moduleContext as any,
		onwarn: getOnWarn(config, defaultOnWarnHandler),
		perf: getOption('perf', false),
		plugins: ensureArray(config.plugins as any),
		preserveEntrySignatures: getOption('preserveEntrySignatures'),
		preserveModules: getOption('preserveModules'),
		preserveSymlinks: getOption('preserveSymlinks'),
		shimMissingExports: getOption('shimMissingExports'),
		strictDeprecations: getOption('strictDeprecations', false),
		treeshake: getObjectOption(config, overrides, 'treeshake'),
		watch: config.watch as any
	};

	// support rollup({ cache: prevBuildObject })
	if (inputOptions.cache && (inputOptions.cache as any).cache)
		inputOptions.cache = (inputOptions.cache as any).cache;

	warnUnknownOptions(
		config,
		Object.keys(inputOptions),
		'input options',
		inputOptions.onwarn as WarningHandler,
		/^output$/
	);
	return inputOptions;
}

export function parseOutputOptions(
	config: GenericConfigObject,
	warn: WarningHandler,
	overrides: GenericConfigObject = {}
): OutputOptions {
	const getOption = createGetOption(config, overrides);
	const outputOptions = {
		amd: { ...(config.amd as object), ...(overrides.amd as object) } as any,
		assetFileNames: getOption('assetFileNames'),
		banner: getOption('banner'),
		chunkFileNames: getOption('chunkFileNames'),
		compact: getOption('compact', false),
		dir: getOption('dir'),
		dynamicImportFunction: getOption('dynamicImportFunction'),
		entryFileNames: getOption('entryFileNames'),
		esModule: getOption('esModule', true),
		exports: normalizeExports(getOption('exports')),
		extend: getOption('extend'),
		externalLiveBindings: getOption('externalLiveBindings', true),
		file: getOption('file'),
		footer: getOption('footer'),
		format: normalizeFormat(getOption('format')),
		freeze: getOption('freeze', true),
		globals: getOption('globals'),
		hoistTransitiveImports: getOption('hoistTransitiveImports', true),
		indent: getOption('indent', true),
		interop: getOption('interop', true),
		intro: getOption('intro'),
		minifyInternalExports: getOption('minifyInternalExports'),
		name: getOption('name'),
		namespaceToStringTag: getOption('namespaceToStringTag', false),
		noConflict: getOption('noConflict'),
		outro: getOption('outro'),
		paths: getOption('paths'),
		plugins: ensureArray(config.plugins as any),
		preferConst: getOption('preferConst'),
		sourcemap: getOption('sourcemap'),
		sourcemapExcludeSources: getOption('sourcemapExcludeSources'),
		sourcemapFile: getOption('sourcemapFile'),
		sourcemapPathTransform: getOption('sourcemapPathTransform'),
		strict: getOption('strict', true)
	};

	warnUnknownOptions(config, Object.keys(outputOptions), 'output options', warn);
	return outputOptions;
}

export function warnUnknownOptions(
	passedOptions: GenericConfigObject,
	validOptions: string[],
	optionType: string,
	warn: WarningHandler,
	ignoredKeys: RegExp = /$./
): void {
	const validOptionSet = new Set(validOptions);
	const unknownOptions = Object.keys(passedOptions).filter(
		key => !(validOptionSet.has(key) || ignoredKeys.test(key))
	);
	if (unknownOptions.length > 0) {
		warn({
			code: 'UNKNOWN_OPTION',
			message: `Unknown ${optionType}: ${unknownOptions.join(', ')}. Allowed options: ${[
				...validOptionSet
			]
				.sort()
				.join(', ')}`
		});
	}
}

function normalizeFormat(format: string): ModuleFormat {
	switch (format) {
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
			return format;
		default:
			return error({
				message: `You must specify "output.format", which can be one of "amd", "cjs", "system", "es", "iife" or "umd".`,
				url: `https://rollupjs.org/guide/en/#output-format`
			});
	}
}

function normalizeExports(exports: string | undefined): 'default' | 'named' | 'none' | 'auto' {
	if (exports && !['default', 'named', 'none', 'auto'].includes(exports)) {
		return error(errInvalidExportOptionValue(exports));
	}
	return exports as 'default' | 'named' | 'none' | 'auto';
}
