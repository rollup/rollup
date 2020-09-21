import {
	GetInterop,
	GlobalsOption,
	InternalModuleFormat,
	InteropType,
	ManualChunksOption,
	ModuleFormat,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OptionsPaths,
	OutputOptions,
	SourcemapPathTransformOption
} from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import { errInvalidExportOptionValue, error, warnDeprecation } from '../error';
import { resolve } from '../path';
import { GenericConfigObject, warnUnknownOptions } from './options';

export function normalizeOutputOptions(
	config: GenericConfigObject,
	inputOptions: NormalizedInputOptions,
	unsetInputOptions: Set<string>
): { options: NormalizedOutputOptions; unsetOptions: Set<string> } {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set(unsetInputOptions);

	const compact = (config.compact as boolean | undefined) || false;
	const format = getFormat(config);
	const inlineDynamicImports = getInlineDynamicImports(config, inputOptions);
	const preserveModules = getPreserveModules(config, inlineDynamicImports, inputOptions);
	const file = getFile(config, preserveModules, inputOptions);

	const outputOptions: NormalizedOutputOptions & OutputOptions = {
		amd: getAmd(config),
		assetFileNames:
			(config.assetFileNames as string | undefined) ?? 'assets/[name]-[hash][extname]',
		banner: getAddon(config, 'banner'),
		chunkFileNames: (config.chunkFileNames as string | undefined) ?? '[name]-[hash].js',
		compact,
		dir: getDir(config, file),
		dynamicImportFunction: getDynamicImportFunction(config, inputOptions),
		entryFileNames: getEntryFileNames(config, unsetOptions),
		esModule: (config.esModule as boolean | undefined) ?? true,
		exports: getExports(config, unsetOptions),
		extend: (config.extend as boolean | undefined) || false,
		externalLiveBindings: (config.externalLiveBindings as boolean | undefined) ?? true,
		file,
		footer: getAddon(config, 'footer'),
		format,
		freeze: (config.freeze as boolean | undefined) ?? true,
		globals: (config.globals as GlobalsOption | undefined) || {},
		hoistTransitiveImports: (config.hoistTransitiveImports as boolean | undefined) ?? true,
		indent: getIndent(config, compact),
		inlineDynamicImports,
		interop: getInterop(config, inputOptions),
		intro: getAddon(config, 'intro'),
		manualChunks: getManualChunks(config, inlineDynamicImports, preserveModules, inputOptions),
		minifyInternalExports: getMinifyInternalExports(config, format, compact),
		name: config.name as string | undefined,
		namespaceToStringTag: (config.namespaceToStringTag as boolean | undefined) || false,
		noConflict: (config.noConflict as boolean | undefined) || false,
		outro: getAddon(config, 'outro'),
		paths: (config.paths as OptionsPaths | undefined) || {},
		plugins: ensureArray(config.plugins) as Plugin[],
		preferConst: (config.preferConst as boolean | undefined) || false,
		preserveModules,
		preserveModulesRoot: getPreserveModulesRoot(config),
		sourcemap: (config.sourcemap as boolean | 'inline' | 'hidden' | undefined) || false,
		sourcemapExcludeSources: (config.sourcemapExcludeSources as boolean | undefined) || false,
		sourcemapFile: config.sourcemapFile as string | undefined,
		sourcemapPathTransform: config.sourcemapPathTransform as
			| SourcemapPathTransformOption
			| undefined,
		strict: (config.strict as boolean | undefined) ?? true,
		systemNullSetters: (config.systemNullSetters as boolean | undefined) || false
	};

	warnUnknownOptions(config, Object.keys(outputOptions), 'output options', inputOptions.onwarn);
	return { options: outputOptions, unsetOptions };
}

const getFile = (
	config: GenericConfigObject,
	preserveModules: boolean,
	inputOptions: NormalizedInputOptions
): string | undefined => {
	const file = config.file as string | undefined;
	if (typeof file === 'string') {
		if (preserveModules) {
			return error({
				code: 'INVALID_OPTION',
				message:
					'You must set "output.dir" instead of "output.file" when using the "output.preserveModules" option.'
			});
		}
		if (!Array.isArray(inputOptions.input))
			return error({
				code: 'INVALID_OPTION',
				message: 'You must set "output.dir" instead of "output.file" when providing named inputs.'
			});
	}
	return file;
};

const getFormat = (config: GenericConfigObject): InternalModuleFormat => {
	const configFormat = config.format as ModuleFormat | undefined;
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
	config: GenericConfigObject,
	inputOptions: NormalizedInputOptions
): boolean => {
	const inlineDynamicImports =
		((config.inlineDynamicImports as boolean | undefined) ?? inputOptions.inlineDynamicImports) ||
		false;
	const { input } = inputOptions;
	if (inlineDynamicImports && (Array.isArray(input) ? input : Object.keys(input)).length > 1) {
		return error({
			code: 'INVALID_OPTION',
			message: 'Multiple inputs are not supported for "output.inlineDynamicImports".'
		});
	}
	return inlineDynamicImports;
};

const getPreserveModules = (
	config: GenericConfigObject,
	inlineDynamicImports: boolean,
	inputOptions: NormalizedInputOptions
): boolean => {
	const preserveModules =
		((config.preserveModules as boolean | undefined) ?? inputOptions.preserveModules) || false;
	if (preserveModules) {
		if (inlineDynamicImports) {
			return error({
				code: 'INVALID_OPTION',
				message: `The "output.inlineDynamicImports" option is not supported for "output.preserveModules".`
			});
		}
		if (inputOptions.preserveEntrySignatures === false) {
			return error({
				code: 'INVALID_OPTION',
				message:
					'Setting "preserveEntrySignatures" to "false" is not supported for "output.preserveModules".'
			});
		}
	}
	return preserveModules;
};

const getPreserveModulesRoot = (config: GenericConfigObject): string | undefined => {
	const preserveModulesRoot = config.preserveModulesRoot as string | null | undefined;
	if (preserveModulesRoot === null || preserveModulesRoot === undefined) {
		return undefined;
	}
	return resolve(preserveModulesRoot);
};

const getAmd = (
	config: GenericConfigObject
): {
	define: string;
	id?: string;
} => ({
	define: 'define',
	...(config.amd as {
		define?: string;
		id?: string;
	})
});

const getAddon = (config: GenericConfigObject, name: string): (() => string | Promise<string>) => {
	const configAddon = config[name] as string | (() => string | Promise<string>);
	if (typeof configAddon === 'function') {
		return configAddon;
	}
	return () => configAddon || '';
};

const getDir = (config: GenericConfigObject, file: string | undefined): string | undefined => {
	const dir = config.dir as string | undefined;
	if (typeof dir === 'string' && typeof file === 'string') {
		return error({
			code: 'INVALID_OPTION',
			message:
				'You must set either "output.file" for a single-file build or "output.dir" when generating multiple chunks.'
		});
	}
	return dir;
};

const getDynamicImportFunction = (
	config: GenericConfigObject,
	inputOptions: NormalizedInputOptions
): string | undefined => {
	const configDynamicImportFunction = config.dynamicImportFunction as string | undefined;
	if (configDynamicImportFunction) {
		warnDeprecation(
			`The "output.dynamicImportFunction" option is deprecated. Use the "renderDynamicImport" plugin hook instead.`,
			false,
			inputOptions
		);
	}
	return configDynamicImportFunction;
};

const getEntryFileNames = (config: GenericConfigObject, unsetOptions: Set<string>): string => {
	const configEntryFileNames = config.entryFileNames as string | undefined;
	if (configEntryFileNames == null) {
		unsetOptions.add('entryFileNames');
	}
	return configEntryFileNames ?? '[name].js';
};

function getExports(
	config: GenericConfigObject,
	unsetOptions: Set<string>
): 'default' | 'named' | 'none' | 'auto' {
	const configExports = config.exports as string | undefined;
	if (configExports == null) {
		unsetOptions.add('exports');
	} else if (!['default', 'named', 'none', 'auto'].includes(configExports)) {
		return error(errInvalidExportOptionValue(configExports));
	}
	return (configExports as 'default' | 'named' | 'none' | 'auto') || 'auto';
}

const getIndent = (config: GenericConfigObject, compact: boolean): string | true => {
	if (compact) {
		return '';
	}
	const configIndent = config.indent as string | boolean | undefined;
	return configIndent === false ? '' : configIndent ?? true;
};

const ALLOWED_INTEROP_TYPES = new Set(['auto', 'esModule', 'default', 'defaultOnly', true, false]);
const getInterop = (
	config: GenericConfigObject,
	inputOptions: NormalizedInputOptions
): GetInterop => {
	const configInterop = config.interop as InteropType | GetInterop | undefined;
	const validatedInteropTypes = new Set<InteropType>();
	const validateInterop = (interop: InteropType): InteropType => {
		if (!validatedInteropTypes.has(interop)) {
			validatedInteropTypes.add(interop);
			if (!ALLOWED_INTEROP_TYPES.has(interop)) {
				return error({
					code: 'INVALID_OPTION',
					message: `The value ${JSON.stringify(
						interop
					)} is not supported for "output.interop". Use one of ${Array.from(
						ALLOWED_INTEROP_TYPES.values(),
						value => JSON.stringify(value)
					).join(', ')} instead.`,
					url: 'https://rollupjs.org/guide/en/#outputinterop'
				});
			}
			if (typeof interop === 'boolean') {
				warnDeprecation(
					{
						message: `The boolean value "${interop}" for the "output.interop" option is deprecated. Use ${
							interop ? '"auto"' : '"esModule", "default" or "defaultOnly"'
						} instead.`,
						url: 'https://rollupjs.org/guide/en/#outputinterop'
					},
					false,
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
	config: GenericConfigObject,
	inlineDynamicImports: boolean,
	preserveModules: boolean,
	inputOptions: NormalizedInputOptions
): ManualChunksOption => {
	const configManualChunks =
		(config.manualChunks as ManualChunksOption | undefined) || inputOptions.manualChunks;
	if (configManualChunks) {
		if (inlineDynamicImports) {
			return error({
				code: 'INVALID_OPTION',
				message:
					'The "output.manualChunks" option is not supported for "output.inlineDynamicImports".'
			});
		}
		if (preserveModules) {
			return error({
				code: 'INVALID_OPTION',
				message: 'The "output.manualChunks" option is not supported for "output.preserveModules".'
			});
		}
	}
	return configManualChunks || {};
};

const getMinifyInternalExports = (
	config: GenericConfigObject,
	format: InternalModuleFormat,
	compact: boolean
): boolean =>
	(config.minifyInternalExports as boolean | undefined) ??
	(compact || format === 'es' || format === 'system');
