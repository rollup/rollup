import injectClassFields from 'acorn-class-fields';
import injectStaticClassFeatures from 'acorn-static-class-features';
import {
	ExternalOption,
	HasModuleSideEffects,
	InputOption,
	InputOptions,
	ManualChunksOption,
	ModuleSideEffectsOption,
	NormalizedInputOptions,
	PreserveEntrySignaturesOption,
	PureModulesOption,
	RollupBuild,
	RollupCache,
	TreeshakingOptions,
	WarningHandler,
	WarningHandlerWithDefault
} from '../../rollup/types';
import { ensureArray } from '../ensureArray';
import { errInvalidOption, error, warnDeprecationWithOptions } from '../error';
import { resolve } from '../path';
import relativeId from '../relativeId';
import { defaultOnWarn, GenericConfigObject, warnUnknownOptions } from './options';

export interface CommandConfigObject {
	external: (string | RegExp)[];
	globals: { [id: string]: string } | undefined;
	[key: string]: unknown;
}

export function normalizeInputOptions(
	config: GenericConfigObject
): { options: NormalizedInputOptions; unsetOptions: Set<string> } {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set<string>();

	const context = (config.context as string | undefined) ?? 'undefined';
	const inlineDynamicImports = (config.inlineDynamicImports as boolean | undefined) || false;
	const onwarn = getOnwarn(config);
	const preserveModules = getPreserveModules(config, inlineDynamicImports);
	const strictDeprecations = (config.strictDeprecations as boolean | undefined) || false;
	const options: NormalizedInputOptions & InputOptions = {
		acorn: getAcorn(config),
		acornInjectPlugins: getAcornInjectPlugins(config),
		cache: getCache(config),
		context,
		experimentalCacheExpiry: (config.experimentalCacheExpiry as number | undefined) ?? 10,
		external: getIdMatcher(config.external as ExternalOption),
		inlineDynamicImports,
		input: getInput(config, inlineDynamicImports),
		manualChunks: getManualChunks(config, inlineDynamicImports, preserveModules),
		moduleContext: getModuleContext(config, context),
		onwarn,
		perf: (config.perf as boolean | undefined) || false,
		plugins: ensureArray(config.plugins) as Plugin[],
		preserveEntrySignatures: getPreserveEntrySignatures(config, unsetOptions, preserveModules),
		preserveModules,
		preserveSymlinks: (config.preserveSymlinks as boolean | undefined) || false,
		shimMissingExports: (config.shimMissingExports as boolean | undefined) || false,
		strictDeprecations,
		treeshake: getTreeshake(config, onwarn, strictDeprecations)
	};

	warnUnknownOptions(
		config,
		[...Object.keys(options), 'watch'],
		'input options',
		options.onwarn,
		/^(output)$/
	);
	return { options, unsetOptions };
}

const getOnwarn = (config: GenericConfigObject): WarningHandler => {
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
				(config.onwarn as WarningHandlerWithDefault)(warning, defaultOnWarn);
		  }
		: defaultOnWarn;
};

const getPreserveModules = (
	config: GenericConfigObject,
	inlineDynamicImports: boolean
): boolean => {
	const preserveModules = (config.preserveModules as boolean | undefined) || false;
	if (preserveModules && inlineDynamicImports) {
		return error({
			code: 'INVALID_OPTION',
			message: `"preserveModules" does not support the "inlineDynamicImports" option.`
		});
	}
	return preserveModules;
};

const getAcorn = (config: GenericConfigObject): acorn.Options => ({
	allowAwaitOutsideFunction: true,
	ecmaVersion: 2020,
	preserveParens: false,
	sourceType: 'module',
	...(config.acorn as Object)
});

const getAcornInjectPlugins = (config: GenericConfigObject): Function[] => [
	injectClassFields,
	injectStaticClassFeatures,
	...(ensureArray(config.acornInjectPlugins) as any)
];

const getCache = (config: GenericConfigObject): false | undefined | RollupCache => {
	return (config.cache as RollupBuild)?.cache || (config.cache as false | undefined | RollupCache);
};

const getIdMatcher = <T extends Array<any>>(
	option:
		| undefined
		| boolean
		| string
		| RegExp
		| (string | RegExp)[]
		| ((id: string, ...args: T) => boolean | null | undefined)
): ((id: string, ...args: T) => boolean) => {
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
};

const getInput = (
	config: GenericConfigObject,
	inlineDynamicImports: boolean
): string[] | { [entryAlias: string]: string } => {
	const configInput = config.input as InputOption | undefined;
	const input =
		configInput == null ? [] : typeof configInput === 'string' ? [configInput] : configInput;
	if (inlineDynamicImports && (Array.isArray(input) ? input : Object.keys(input)).length > 1) {
		return error({
			code: 'INVALID_OPTION',
			message: 'Multiple inputs are not supported for "inlineDynamicImports".'
		});
	}
	return input;
};

const getManualChunks = (
	config: GenericConfigObject,
	inlineDynamicImports: boolean,
	preserveModules: boolean
): ManualChunksOption => {
	const configManualChunks = config.manualChunks as ManualChunksOption;
	if (configManualChunks) {
		if (inlineDynamicImports) {
			return error({
				code: 'INVALID_OPTION',
				message: '"manualChunks" option is not supported for "inlineDynamicImports".'
			});
		}
		if (preserveModules) {
			return error({
				code: 'INVALID_OPTION',
				message: '"preserveModules" does not support the "manualChunks" option.'
			});
		}
	}
	return configManualChunks || {};
};

const getModuleContext = (
	config: GenericConfigObject,
	context: string
): ((id: string) => string) => {
	const configModuleContext = config.moduleContext as
		| ((id: string) => string | null | undefined)
		| { [id: string]: string }
		| undefined;
	if (typeof configModuleContext === 'function') {
		return id => configModuleContext(id) ?? context;
	}
	if (configModuleContext) {
		const contextByModuleId = Object.create(null);
		for (const key of Object.keys(configModuleContext)) {
			contextByModuleId[resolve(key)] = configModuleContext[key];
		}
		return id => contextByModuleId[id] || context;
	}
	return () => context;
};

const getPreserveEntrySignatures = (
	config: GenericConfigObject,
	unsetOptions: Set<string>,
	preserveModules: boolean
): PreserveEntrySignaturesOption => {
	const configPreserveEntrySignatures = config.preserveEntrySignatures as
		| PreserveEntrySignaturesOption
		| undefined;
	if (configPreserveEntrySignatures == null) {
		unsetOptions.add('preserveEntrySignatures');
	} else if (configPreserveEntrySignatures === false && preserveModules) {
		return error({
			code: 'INVALID_OPTION',
			message: '"preserveModules" does not support setting "preserveEntrySignatures" to "false".'
		});
	}
	return configPreserveEntrySignatures ?? 'strict';
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
