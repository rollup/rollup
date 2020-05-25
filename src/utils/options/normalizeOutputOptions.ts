import {
	ModuleFormat,
	NormalizedInputOptions,
	NormalizedOutputOptions,
	OutputOptions
} from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import { errInvalidExportOptionValue, error } from '../error';
import { GenericConfigObject, warnUnknownOptions } from './options';

// TODO Lukas is it possible to connect these options with the regular options
// so that new parameters are not forgot?
export function normalizeOutputOptions(
	config: GenericConfigObject,
	inputOptions: NormalizedInputOptions
): { options: NormalizedOutputOptions; unsetOptions: Set<string> } {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set<string>();

	// TODO Lukas inline
	const getOption = (name: string, defaultValue?: unknown): any => config[name] ?? defaultValue;

	const file = getFile(config, inputOptions);
	const outputOptions: NormalizedOutputOptions & OutputOptions = {
		amd: getAmd(config),
		assetFileNames:
			(config.assetFileNames as string | undefined) ?? 'assets/[name]-[hash][extname]',
		banner: getAddon(config, 'banner'),
		chunkFileNames: (config.chunkFileNames as string | undefined) ?? '[name]-[hash].js',
		compact: getOption('compact', false),
		dir: getDir(config, file),
		dynamicImportFunction: getOption('dynamicImportFunction'),
		entryFileNames: getEntryFileNames(config, unsetOptions),
		esModule: getOption('esModule', true),
		exports: normalizeExports(getOption('exports')),
		extend: getOption('extend'),
		externalLiveBindings: getOption('externalLiveBindings', true),
		file,
		footer: getAddon(config, 'footer'),
		format: normalizeFormat(getOption('format')),
		freeze: getOption('freeze', true),
		globals: getOption('globals'),
		hoistTransitiveImports: getOption('hoistTransitiveImports', true),
		indent: getOption('indent', true),
		interop: getOption('interop', true),
		intro: getAddon(config, 'intro'),
		minifyInternalExports: getOption('minifyInternalExports'),
		name: getOption('name'),
		namespaceToStringTag: getOption('namespaceToStringTag', false),
		noConflict: getOption('noConflict'),
		outro: getAddon(config, 'outro'),
		paths: getOption('paths'),
		plugins: ensureArray(config.plugins as any),
		preferConst: getOption('preferConst'),
		sourcemap: getOption('sourcemap'),
		sourcemapExcludeSources: getOption('sourcemapExcludeSources'),
		sourcemapFile: getOption('sourcemapFile'),
		sourcemapPathTransform: getOption('sourcemapPathTransform'),
		strict: getOption('strict', true)
	};

	warnUnknownOptions(config, Object.keys(outputOptions), 'output options', inputOptions.onwarn);
	return { options: outputOptions, unsetOptions };
}

const getFile = (
	config: GenericConfigObject,
	inputOptions: NormalizedInputOptions
): string | undefined => {
	const file = config.file as string | undefined;
	if (typeof file === 'string') {
		if (inputOptions.preserveModules) {
			return error({
				code: 'INVALID_OPTION',
				message:
					'You must set "output.dir" instead of "output.file" when using the "preserveModules" option.'
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

const getEntryFileNames = (config: GenericConfigObject, unsetOptions: Set<string>): string => {
	const configEntryFileNames = config.entryFileNames as string | undefined;
	if (configEntryFileNames == null) {
		unsetOptions.add('entryFileNames');
	}
	return configEntryFileNames ?? '[name].js';
};

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
