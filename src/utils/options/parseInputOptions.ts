import injectClassFields from 'acorn-class-fields';
import injectImportMeta from 'acorn-import-meta';
import injectStaticClassFeatures from 'acorn-static-class-features';
import { NormalizedInputOptions, RollupCache, WarningHandler } from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import {
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
export function parseInputOptions(config: GenericConfigObject): NormalizedInputOptions {
	// TODO Lukas inline trivial case, create helper for tracked defaults?
	// TODO Lukas improve this together with type
	const getOption = (name: string, defaultValue: any): any => config[name] ?? defaultValue;
	const inputOptions: NormalizedInputOptions = {
		acorn: getAcorn(config),
		acornInjectPlugins: getAcornInjectPlugins(config),
		cache: config.cache as false | undefined | RollupCache,
		// TODO Lukas continue here
		context: config.context as any,
		experimentalCacheExpiry: getOption('experimentalCacheExpiry', 10),
		// TODO Lukas use real implementation
		external: getExternal(config, { external: [] } as any) as any,
		inlineDynamicImports: getOption('inlineDynamicImports', false),
		input: getOption('input', []),
		manualChunks: config.manualChunks as any,
		moduleContext: config.moduleContext as any,
		onwarn: getOnWarn(config, defaultOnWarn),
		perf: getOption('perf', false),
		plugins: ensureArray(config.plugins) as Plugin[],
		preserveEntrySignatures: config.preserveEntrySignatures as any,
		preserveModules: config.preserveModules as any,
		preserveSymlinks: config.preserveSymlinks as any,
		shimMissingExports: config.shimMissingExports as any,
		strictDeprecations: getOption('strictDeprecations', false),
		// TODO Lukas create real getter
		treeshake: normalizeObjectOptionValue(config.treeshake),
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

const getAcorn = (config: GenericConfigObject): acorn.Options => ({
	allowAwaitOutsideFunction: true,
	ecmaVersion: 2020,
	preserveParens: false,
	sourceType: 'module',
	...(config.acorn as Object)
});

const getAcornInjectPlugins = (config: GenericConfigObject): Function[] => [
	injectImportMeta,
	injectClassFields,
	injectStaticClassFeatures,
	...(ensureArray(config.acornInjectPlugins) as any)
];

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
