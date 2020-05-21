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
): NormalizedOutputOptions {
	// TODO Lukas inline
	const getOption = (name: string, defaultValue?: unknown): any => config[name] ?? defaultValue;
	const file = getFile(config, inputOptions);
	const outputOptions: NormalizedOutputOptions & OutputOptions = {
		amd: config.amd as any,
		assetFileNames: getOption('assetFileNames'),
		banner: getOption('banner'),
		chunkFileNames: getOption('chunkFileNames'),
		compact: getOption('compact', false),
		dir: getDir(config, file),
		dynamicImportFunction: getOption('dynamicImportFunction'),
		entryFileNames: getOption('entryFileNames'),
		esModule: getOption('esModule', true),
		exports: normalizeExports(getOption('exports')),
		extend: getOption('extend'),
		externalLiveBindings: getOption('externalLiveBindings', true),
		file,
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

	warnUnknownOptions(config, Object.keys(outputOptions), 'output options', inputOptions.onwarn);
	return outputOptions;
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
