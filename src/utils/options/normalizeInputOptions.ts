import type {
	HasModuleSideEffects,
	InputOptions,
	ModuleSideEffectsOption,
	NormalizedInputOptions,
	RollupBuild,
	RollupFsModule
} from '../../rollup/types';
import { EMPTY_ARRAY } from '../blank';
import { ensureArray } from '../ensureArray';
import * as fs from '../fs';
import { getLogger } from '../logger';
import { LOGLEVEL_INFO } from '../logging';
import { error, logInvalidOption } from '../logs';
import { resolve } from '../path';
import { URL_JSX, URL_TREESHAKE, URL_TREESHAKE_MODULESIDEEFFECTS } from '../urls';
import {
	getOnLog,
	getOptionWithPreset,
	jsxPresets,
	normalizePluginOption,
	treeshakePresets,
	warnUnknownOptions
} from './options';

export interface CommandConfigObject {
	[key: string]: unknown;
	external: (string | RegExp)[];
	globals: Record<string, string> | undefined;
}

export async function normalizeInputOptions(
	config: InputOptions,
	watchMode: boolean
): Promise<{
	options: NormalizedInputOptions;
	unsetOptions: Set<string>;
}> {
	// These are options that may trigger special warnings or behaviour later
	// if the user did not select an explicit value
	const unsetOptions = new Set<string>();

	const context = config.context ?? 'undefined';
	const plugins = await normalizePluginOption(config.plugins);
	const logLevel = config.logLevel || LOGLEVEL_INFO;
	const onLog = getLogger(plugins, getOnLog(config, logLevel), watchMode, logLevel);
	const strictDeprecations = config.strictDeprecations || false;
	const maxParallelFileOps = getMaxParallelFileOps(config);
	const options: NormalizedInputOptions & InputOptions = {
		cache: getCache(config),
		context,
		experimentalCacheExpiry: config.experimentalCacheExpiry ?? 10,
		experimentalLogSideEffects: config.experimentalLogSideEffects || false,
		external: getIdMatcher(config.external),
		fs: config.fs ?? (fs as RollupFsModule),
		input: getInput(config),
		jsx: getJsx(config),
		logLevel,
		makeAbsoluteExternalsRelative: config.makeAbsoluteExternalsRelative ?? 'ifRelativeSource',
		maxParallelFileOps,
		moduleContext: getModuleContext(config, context),
		onLog,
		perf: config.perf || false,
		plugins,
		preserveEntrySignatures: config.preserveEntrySignatures ?? 'exports-only',
		preserveSymlinks: config.preserveSymlinks || false,
		shimMissingExports: config.shimMissingExports || false,
		strictDeprecations,
		treeshake: getTreeshake(config)
	};

	warnUnknownOptions(
		config,
		[...Object.keys(options), 'onwarn', 'watch'],
		'input options',
		onLog,
		/^(output)$/
	);
	return { options, unsetOptions };
}

const getCache = (config: InputOptions): NormalizedInputOptions['cache'] =>
	config.cache === true // `true` is the default
		? undefined
		: (config.cache as unknown as RollupBuild)?.cache || config.cache;

const getIdMatcher = <T extends any[]>(
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
		return (id, ...parameters) => (id[0] !== '\0' && option(id, ...parameters)) || false;
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

const getInput = (config: InputOptions): NormalizedInputOptions['input'] => {
	const configInput = config.input;
	return configInput == null ? [] : typeof configInput === 'string' ? [configInput] : configInput;
};

const getJsx = (config: InputOptions): NormalizedInputOptions['jsx'] => {
	const configJsx = config.jsx;
	if (!configJsx) return false;
	const configWithPreset = getOptionWithPreset(configJsx, jsxPresets, 'jsx', URL_JSX, 'false, ');
	const { factory, importSource, mode } = configWithPreset;
	switch (mode) {
		case 'automatic': {
			return {
				factory: factory || 'React.createElement',
				importSource: importSource || 'react',
				jsxImportSource: configWithPreset.jsxImportSource || 'react/jsx-runtime',
				mode: 'automatic'
			};
		}
		case 'preserve': {
			if (importSource && !(factory || configWithPreset.fragment)) {
				error(
					logInvalidOption(
						'jsx',
						URL_JSX,
						'when preserving JSX and specifying an importSource, you also need to specify a factory or fragment'
					)
				);
			}
			return {
				factory: factory || null,
				fragment: configWithPreset.fragment || null,
				importSource: importSource || null,
				mode: 'preserve'
			};
		}
		// case 'classic':
		default: {
			if (mode && mode !== 'classic') {
				error(
					logInvalidOption(
						'jsx.mode',
						URL_JSX,
						'mode must be "automatic", "classic" or "preserve"',
						mode
					)
				);
			}
			return {
				factory: factory || 'React.createElement',
				fragment: configWithPreset.fragment || 'React.Fragment',
				importSource: importSource || null,
				mode: 'classic'
			};
		}
	}
};

const getMaxParallelFileOps = (
	config: InputOptions
): NormalizedInputOptions['maxParallelFileOps'] => {
	const maxParallelFileOps = config.maxParallelFileOps;
	if (typeof maxParallelFileOps === 'number') {
		if (maxParallelFileOps <= 0) return Infinity;
		return maxParallelFileOps;
	}
	return 1000;
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
		const contextByModuleId: Record<string, string> = Object.create(null);
		for (const [key, moduleContext] of Object.entries(configModuleContext)) {
			contextByModuleId[resolve(key)] = moduleContext;
		}
		return id => contextByModuleId[id] ?? context;
	}
	return () => context;
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
			id[0] === '\0' ? true : moduleSideEffectsOption(id, external) !== false;
	}
	if (Array.isArray(moduleSideEffectsOption)) {
		const ids = new Set(moduleSideEffectsOption);
		return id => ids.has(id);
	}
	if (moduleSideEffectsOption) {
		error(
			logInvalidOption(
				'treeshake.moduleSideEffects',
				URL_TREESHAKE_MODULESIDEEFFECTS,
				'please use one of false, "no-external", a function or an array'
			)
		);
	}
	return () => true;
};
