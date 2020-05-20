import { ModuleFormat, OutputOptions, WarningHandler } from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import { errInvalidExportOptionValue, error } from '../error';
import { GenericConfigObject, warnUnknownOptions } from './parseOptions';

// TODO Lukas normalize is a better name
export function parseOutputOptions(
	config: GenericConfigObject,
	warn: WarningHandler,
	overrides: GenericConfigObject = {}
): OutputOptions {
	const getOption = (name: string, defaultValue?: unknown): any =>
		overrides[name] ?? config[name] ?? defaultValue;
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
