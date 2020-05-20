import injectClassFields from 'acorn-class-fields';
import injectImportMeta from 'acorn-import-meta';
import injectStaticClassFeatures from 'acorn-static-class-features';
import {
	ExternalOption,
	HasModuleSideEffects,
	ModuleSideEffectsOption,
	NormalizedInputOptions,
	PureModulesOption,
	RollupCache,
	TreeshakingOptions,
	WarningHandler,
	WarningHandlerWithDefault
} from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import { errInvalidOption, warnDeprecationWithOptions } from '../error';
import { resolve } from '../path';
import relativeId from '../relativeId';
import { GenericConfigObject, warnUnknownOptions } from './parseOptions';

export interface CommandConfigObject {
	external: (string | RegExp)[];
	globals: { [id: string]: string } | undefined;
	[key: string]: unknown;
}

// TODO Lukas "normalize" might be a better name
export function parseInputOptions(config: GenericConfigObject): NormalizedInputOptions {
	// TODO Lukas inline trivial case, create helper for tracked defaults?
	// TODO Lukas improve this together with type
	// TODO Lukas do not access graph.options but pass it down
	const getOption = (name: string, defaultValue: any): any => config[name] ?? defaultValue;

	const context = (config.context as string | undefined) ?? 'undefined';
	const onwarn = getOnwarn(config);
	const strictDeprecations = (config.strictDeprecations as boolean | undefined) || false;
	const inputOptions: NormalizedInputOptions = {
		acorn: getAcorn(config),
		acornInjectPlugins: getAcornInjectPlugins(config),
		cache: config.cache as false | undefined | RollupCache,
		context,
		experimentalCacheExpiry: (config.experimentalCacheExpiry as number | undefined) ?? 10,
		external: getIdMatcher(config.external as ExternalOption),
		inlineDynamicImports: getOption('inlineDynamicImports', false),
		input: getOption('input', []),
		manualChunks: config.manualChunks as any,
		moduleContext: getModuleContext(config, context),
		onwarn,
		perf: getOption('perf', false),
		plugins: ensureArray(config.plugins) as Plugin[],
		preserveEntrySignatures: config.preserveEntrySignatures as any,
		preserveModules: config.preserveModules as any,
		preserveSymlinks: config.preserveSymlinks as any,
		shimMissingExports: config.shimMissingExports as any,
		strictDeprecations,
		treeshake: getTreeshake(config, onwarn, strictDeprecations),
		watch: config.watch as any
	};

	// support rollup({ cache: prevBuildObject })
	if (inputOptions.cache && (inputOptions.cache as any).cache)
		inputOptions.cache = (inputOptions.cache as any).cache;

	warnUnknownOptions(
		config,
		Object.keys(inputOptions),
		'input options',
		inputOptions.onwarn,
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

function getIdMatcher<T extends Array<any>>(
	option:
		| undefined
		| boolean
		| string
		| RegExp
		| (string | RegExp)[]
		| ((id: string, ...args: T) => boolean | null | undefined)
): (id: string, ...args: T) => boolean {
	if (option === true) {
		return () => true;
	}
	if (typeof option === 'function') {
		return (id, ...args) => (!id.startsWith('\0') && option(id, ...args)) || false;
	}
	if (option) {
		const ids = new Set<string>();
		const matchers: RegExp[] = [];
		for (const value of ensureArray(option)) {
			if (value instanceof RegExp) {
				matchers.push(value);
			} else {
				ids.add(value);
			}
		}
		return (id => ids.has(id) || matchers.some(matcher => matcher.test(id))) as (
			id: string,
			...args: T
		) => boolean;
	}
	return () => false;
}

const getModuleContext = (
	config: GenericConfigObject,
	context: string
): ((id: string) => string) => {
	const moduleContext = config.moduleContext;
	if (typeof moduleContext === 'function') {
		return id => moduleContext(id) ?? context;
	}
	if (moduleContext) {
		const contextByModuleId = Object.create(null);
		for (const key of Object.keys(moduleContext as { [key: string]: string })) {
			contextByModuleId[resolve(key)] = (moduleContext as { [key: string]: string })[key];
		}
		return id => contextByModuleId[id] || context;
	}
	return () => context;
};

const getOnwarn = (config: GenericConfigObject): WarningHandler => {
	const defaultHandler: WarningHandler = warning => console.warn(warning.message || warning);
	return config.onwarn
		? warning => {
				warning.toString = () => {
					let str = '';

					if (warning.plugin) str += `(${warning.plugin} plugin) `;
					if (warning.loc)
						str += `${relativeId(warning.loc.file!)} (${warning.loc.line}:${warning.loc.column}) `;
					str += warning.message;

					return str;
				};
				(config.onwarn as WarningHandlerWithDefault)(warning, defaultHandler);
		  }
		: defaultHandler;
};

const getTreeshake = (
	config: GenericConfigObject,
	warn: WarningHandler,
	strictDeprecations: boolean
):
	| false
	| {
			annotations: boolean;
			moduleSideEffects: HasModuleSideEffects;
			propertyReadSideEffects: boolean;
			tryCatchDeoptimization: boolean;
			unknownGlobalSideEffects: boolean;
	  } => {
	const configTreeshake = config.treeshake as boolean | TreeshakingOptions;
	if (configTreeshake === false) {
		return false;
	}
	if (configTreeshake && configTreeshake !== true) {
		if (typeof configTreeshake.pureExternalModules !== 'undefined') {
			warnDeprecationWithOptions(
				`The "treeshake.pureExternalModules" option is deprecated. The "treeshake.moduleSideEffects" option should be used instead. "treeshake.pureExternalModules: true" is equivalent to "treeshake.moduleSideEffects: 'no-external'"`,
				true,
				warn,
				strictDeprecations
			);
		}
		return {
			annotations: configTreeshake.annotations !== false,
			moduleSideEffects: getHasModuleSideEffects(
				configTreeshake.moduleSideEffects,
				configTreeshake.pureExternalModules,
				warn
			),
			propertyReadSideEffects: configTreeshake.propertyReadSideEffects !== false,
			tryCatchDeoptimization: configTreeshake.tryCatchDeoptimization !== false,
			unknownGlobalSideEffects: configTreeshake.unknownGlobalSideEffects !== false
		};
	}
	return {
		annotations: true,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: true
	};
};

const getHasModuleSideEffects = (
	moduleSideEffectsOption: ModuleSideEffectsOption | undefined,
	pureExternalModules: PureModulesOption | undefined,
	warn: WarningHandler
): HasModuleSideEffects => {
	if (typeof moduleSideEffectsOption === 'boolean') {
		return () => moduleSideEffectsOption;
	}
	if (moduleSideEffectsOption === 'no-external') {
		return (_id, external) => !external;
	}
	if (typeof moduleSideEffectsOption === 'function') {
		return (id, external) =>
			!id.startsWith('\0') ? moduleSideEffectsOption(id, external) !== false : true;
	}
	if (Array.isArray(moduleSideEffectsOption)) {
		const ids = new Set(moduleSideEffectsOption);
		return id => ids.has(id);
	}
	if (moduleSideEffectsOption) {
		warn(
			errInvalidOption(
				'treeshake.moduleSideEffects',
				'please use one of false, "no-external", a function or an array'
			)
		);
	}
	const isPureExternalModule = getIdMatcher(pureExternalModules);
	return (id, external) => !(external && isPureExternalModule(id));
};
