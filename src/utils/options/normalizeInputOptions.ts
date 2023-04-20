import type * as acorn from 'acorn';
import { importAssertions } from 'acorn-import-assertions';
import type {
	HasModuleSideEffects,
	InputOptions,
	ModuleSideEffectsOption,
	NormalizedInputOptions,
	RollupBuild,
	WarningHandler
} from '../../rollup/types';
import { EMPTY_ARRAY } from '../blank';
import { ensureArray } from '../ensureArray';
import { error, errorInvalidOption, warnDeprecationWithOptions } from '../error';
import { resolve } from '../path';
import relativeId from '../relativeId';
import {
	URL_MAXPARALLELFILEOPS,
	URL_OUTPUT_INLINEDYNAMICIMPORTS,
	URL_OUTPUT_MANUALCHUNKS,
	URL_OUTPUT_PRESERVEMODULES,
	URL_TREESHAKE,
	URL_TREESHAKE_MODULESIDEEFFECTS
} from '../urls';
import {
	defaultOnWarn,
	getOptionWithPreset,
	normalizePluginOption,
	treeshakePresets,
	warnUnknownOptions
} from './options';

export interface CommandConfigObject {
	[key: string]: unknown;
	external: (string | RegExp)[];
	globals: { [id: string]: string } | undefined;
}

export async function normalizeInputOptions(config: InputOptions): Promise<{
	options: NormalizedInputOptions;
	unsetOptions: Set<string>;
}> {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set<string>();

	const context = config.context ?? 'undefined';
	const onwarn = getOnwarn(config);
	const strictDeprecations = config.strictDeprecations || false;
	const maxParallelFileOps = getmaxParallelFileOps(config, onwarn, strictDeprecations);
	const options: NormalizedInputOptions & InputOptions = {
		acorn: getAcorn(config) as unknown as NormalizedInputOptions['acorn'],
		acornInjectPlugins: getAcornInjectPlugins(config),
		cache: getCache(config),
		context,
		experimentalCacheExpiry: config.experimentalCacheExpiry ?? 10,
		experimentalLogSideEffects: config.experimentalLogSideEffects || false,
		external: getIdMatcher(config.external),
		inlineDynamicImports: getInlineDynamicImports(config, onwarn, strictDeprecations),
		input: getInput(config),
		makeAbsoluteExternalsRelative: config.makeAbsoluteExternalsRelative ?? 'ifRelativeSource',
		manualChunks: getManualChunks(config, onwarn, strictDeprecations),
		maxParallelFileOps,
		maxParallelFileReads: maxParallelFileOps,
		moduleContext: getModuleContext(config, context),
		onwarn,
		perf: config.perf || false,
		plugins: await normalizePluginOption(config.plugins),
		preserveEntrySignatures: config.preserveEntrySignatures ?? 'exports-only',
		preserveModules: getPreserveModules(config, onwarn, strictDeprecations),
		preserveSymlinks: config.preserveSymlinks || false,
		shimMissingExports: config.shimMissingExports || false,
		strictDeprecations,
		treeshake: getTreeshake(config)
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

const getOnwarn = (config: InputOptions): NormalizedInputOptions['onwarn'] => {
	const { onwarn } = config;
	return onwarn
		? warning => {
				warning.toString = () => {
					let warningString = '';

					if (warning.plugin) warningString += `(${warning.plugin} plugin) `;
					if (warning.loc)
						warningString += `${relativeId(warning.loc.file!)} (${warning.loc.line}:${
							warning.loc.column
						}) `;
					warningString += warning.message;

					return warningString;
				};
				onwarn(warning, defaultOnWarn);
		  }
		: defaultOnWarn;
};

const getAcorn = (config: InputOptions): acorn.Options => ({
	ecmaVersion: 'latest',
	sourceType: 'module',
	...config.acorn
});

const getAcornInjectPlugins = (
	config: InputOptions
): NormalizedInputOptions['acornInjectPlugins'] => [
	importAssertions,
	...ensureArray(config.acornInjectPlugins)
];

const getCache = (config: InputOptions): NormalizedInputOptions['cache'] =>
	config.cache === true // `true` is the default
		? undefined
		: (config.cache as unknown as RollupBuild)?.cache || config.cache;

const getIdMatcher = <T extends Array<any>>(
	option:
		| undefined
		| boolean
		| string
		| RegExp
		| (string | RegExp)[]
		| ((id: string, ...parameters: T) => boolean | null | void)
): ((id: string, ...parameters: T) => boolean) => {
	if (option === true) {
		return () => true;
	}
	if (typeof option === 'function') {
		return (id, ...parameters) => (!id.startsWith('\0') && option(id, ...parameters)) || false;
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
		return (id: string, ..._arguments) => ids.has(id) || matchers.some(matcher => matcher.test(id));
	}
	return () => false;
};

const getInlineDynamicImports = (
	config: InputOptions,
	warn: WarningHandler,
	strictDeprecations: boolean
): NormalizedInputOptions['inlineDynamicImports'] => {
	const configInlineDynamicImports = config.inlineDynamicImports;
	if (configInlineDynamicImports) {
		warnDeprecationWithOptions(
			'The "inlineDynamicImports" option is deprecated. Use the "output.inlineDynamicImports" option instead.',
			URL_OUTPUT_INLINEDYNAMICIMPORTS,
			true,
			warn,
			strictDeprecations
		);
	}
	return configInlineDynamicImports;
};

const getInput = (config: InputOptions): NormalizedInputOptions['input'] => {
	const configInput = config.input;
	return configInput == null ? [] : typeof configInput === 'string' ? [configInput] : configInput;
};

const getManualChunks = (
	config: InputOptions,
	warn: WarningHandler,
	strictDeprecations: boolean
): NormalizedInputOptions['manualChunks'] => {
	const configManualChunks = config.manualChunks;
	if (configManualChunks) {
		warnDeprecationWithOptions(
			'The "manualChunks" option is deprecated. Use the "output.manualChunks" option instead.',
			URL_OUTPUT_MANUALCHUNKS,
			true,
			warn,
			strictDeprecations
		);
	}
	return configManualChunks;
};

const getmaxParallelFileOps = (
	config: InputOptions,
	warn: WarningHandler,
	strictDeprecations: boolean
): NormalizedInputOptions['maxParallelFileOps'] => {
	const maxParallelFileReads = config.maxParallelFileReads;
	if (typeof maxParallelFileReads === 'number') {
		warnDeprecationWithOptions(
			'The "maxParallelFileReads" option is deprecated. Use the "maxParallelFileOps" option instead.',
			URL_MAXPARALLELFILEOPS,
			true,
			warn,
			strictDeprecations
		);
	}
	const maxParallelFileOps = config.maxParallelFileOps ?? maxParallelFileReads;
	if (typeof maxParallelFileOps === 'number') {
		if (maxParallelFileOps <= 0) return Infinity;
		return maxParallelFileOps;
	}
	return 20;
};

const getModuleContext = (
	config: InputOptions,
	context: string
): NormalizedInputOptions['moduleContext'] => {
	const configModuleContext = config.moduleContext;
	if (typeof configModuleContext === 'function') {
		return id => configModuleContext(id) ?? context;
	}
	if (configModuleContext) {
		const contextByModuleId: {
			[key: string]: string;
		} = Object.create(null);
		for (const [key, moduleContext] of Object.entries(configModuleContext)) {
			contextByModuleId[resolve(key)] = moduleContext;
		}
		return id => contextByModuleId[id] ?? context;
	}
	return () => context;
};

const getPreserveModules = (
	config: InputOptions,
	warn: WarningHandler,
	strictDeprecations: boolean
): NormalizedInputOptions['preserveModules'] => {
	const configPreserveModules = config.preserveModules;
	if (configPreserveModules) {
		warnDeprecationWithOptions(
			'The "preserveModules" option is deprecated. Use the "output.preserveModules" option instead.',
			URL_OUTPUT_PRESERVEMODULES,
			true,
			warn,
			strictDeprecations
		);
	}
	return configPreserveModules;
};

const getTreeshake = (config: InputOptions): NormalizedInputOptions['treeshake'] => {
	const configTreeshake = config.treeshake;
	if (configTreeshake === false) {
		return false;
	}
	const configWithPreset = getOptionWithPreset(
		config.treeshake,
		treeshakePresets,
		'treeshake',
		URL_TREESHAKE,
		'false, true, '
	);
	return {
		annotations: configWithPreset.annotations !== false,
		correctVarValueBeforeDeclaration: configWithPreset.correctVarValueBeforeDeclaration === true,
		deterministicDynamicImports: configWithPreset.deterministicDynamicImports !== false,
		manualPureFunctions:
			(configWithPreset.manualPureFunctions as readonly string[] | undefined) ?? EMPTY_ARRAY,
		moduleSideEffects: getHasModuleSideEffects(
			configWithPreset.moduleSideEffects as ModuleSideEffectsOption | undefined
		),
		propertyReadSideEffects:
			configWithPreset.propertyReadSideEffects === 'always'
				? 'always'
				: configWithPreset.propertyReadSideEffects !== false,
		tryCatchDeoptimization: configWithPreset.tryCatchDeoptimization !== false,
		unknownGlobalSideEffects: configWithPreset.unknownGlobalSideEffects !== false
	};
};

const getHasModuleSideEffects = (
	moduleSideEffectsOption: ModuleSideEffectsOption | undefined
): HasModuleSideEffects => {
	if (typeof moduleSideEffectsOption === 'boolean') {
		return () => moduleSideEffectsOption;
	}
	if (moduleSideEffectsOption === 'no-external') {
		return (_id, external) => !external;
	}
	if (typeof moduleSideEffectsOption === 'function') {
		return (id, external) =>
			id.startsWith('\0') ? true : moduleSideEffectsOption(id, external) !== false;
	}
	if (Array.isArray(moduleSideEffectsOption)) {
		const ids = new Set(moduleSideEffectsOption);
		return id => ids.has(id);
	}
	if (moduleSideEffectsOption) {
		error(
			errorInvalidOption(
				'treeshake.moduleSideEffects',
				URL_TREESHAKE_MODULESIDEEFFECTS,
				'please use one of false, "no-external", a function or an array'
			)
		);
	}
	return () => true;
};
