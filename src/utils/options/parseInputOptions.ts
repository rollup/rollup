import { InputOptions, WarningHandler } from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import {
	createGetOption,
	defaultOnWarn,
	GenericConfigObject,
	getOnWarn,
	normalizeObjectOptionValue,
	warnUnknownOptions
} from './parseOptions';

export interface CommandConfigObject {
	external: (string | RegExp)[];
	globals: { [id: string]: string } | undefined;
	[key: string]: unknown;
}

// TODO Lukas "normalize" might be a better name
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

// TODO Lukas remove
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
