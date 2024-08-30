import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref, shallowRef, watchEffect } from 'vue';
import type { RollupOptions } from '../../../src/rollup/types';
import { useModules } from './modules';
import { useRollupOutput } from './rollupOutput';

interface BaseOptionType<T> {
	available: Ref<boolean | undefined>;
	defaultValue: T | undefined;
	name: string;
	required: Ref<boolean>;
	type: string;
	value: Ref<T | undefined>;
}

interface OptionTypeSelect<T> extends BaseOptionType<T> {
	options: Ref<T[]>;
	type: 'select';
}

interface OptionTypeString extends BaseOptionType<string> {
	placeholder: string | null;
	type: 'string';
}

interface OptionTypeStringMapping extends BaseOptionType<Record<string, string>> {
	keys: Ref<string[]>;
	type: 'string-mapping';
}

interface OptionTypeNumber extends BaseOptionType<number> {
	placeholder: string | null;
	type: 'number';
}

type OptionType =
	| OptionTypeSelect<unknown>
	| OptionTypeString
	| OptionTypeStringMapping
	| OptionTypeNumber;

const mapOptions = {
	number({ defaultValue, name, placeholder, required, value }: OptionTypeNumber) {
		return {
			name,
			placeholder,
			removable: !required.value,
			type: 'number',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	},
	select({ defaultValue, name, options, required, value }: OptionTypeSelect<unknown>) {
		return {
			name,
			options: options.value,
			removable: !required.value,
			type: 'select',
			value:
				value.value === undefined || !options.value.includes(value.value)
					? defaultValue
					: value.value
		} as const;
	},
	string({ defaultValue, name, placeholder, required, value }: OptionTypeString) {
		return {
			name,
			placeholder,
			removable: !required.value,
			type: 'string',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	},
	'string-mapping'({ defaultValue, keys, name, required, value }: OptionTypeStringMapping) {
		return {
			keys: keys.value,
			name,
			removable: !required.value,
			type: 'string-mapping',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	}
};

type Option = ReturnType<(typeof mapOptions)[keyof typeof mapOptions]>;

const alwaysTrue = computed(() => true);
const alwaysFalse = computed(() => false);

const allFormats = ['es', 'amd', 'cjs', 'iife', 'umd', 'system'];
const codeSplittingFormats = ['es', 'amd', 'cjs', 'system'];
const amdFormats = new Set(['amd', 'umd']);
const iifeFormats = new Set(['iife', 'umd']);
const interopFormats = new Set(['amd', 'cjs', 'iife', 'umd']);

const isOptionShown = ({ required, available, value }: OptionType) =>
	available.value && (required.value || value.value !== undefined);

export const useOptions = defineStore('options2', () => {
	const rollupOutputStore = useRollupOutput();
	const modulesStore = useModules();

	const outputHasMultipleChunks = computed(() => rollupOutputStore.output?.output.length > 1);
	const isAmdFormat = computed(() => {
		const { value } = optionOutputFormat.value;
		return value != null && amdFormats.has(value);
	});
	const isIifeFormat = computed(() => {
		const { value } = optionOutputFormat.value;
		return value != null && iifeFormats.has(value);
	});
	const isInteropFormat = computed(() => {
		const { value } = optionOutputFormat.value;
		return value != null && interopFormats.has(value);
	});
	const externalImports = computed(() => rollupOutputStore.output?.externalImports || []);
	const isTreeshakeEnabled = computed(() =>
		[undefined, true].includes(optionTreeshake.value.value as any)
	);

	const optionContext = getString({
		defaultValue: 'undefined',
		name: 'context'
	});
	const optionExperimentalLogSideEffects = getBoolean({
		name: 'experimentalLogSideEffects'
	});
	const optionOutputAmdAutoId = getBoolean({
		available: () => isAmdFormat.value,
		name: 'output.amd.autoId'
	});
	const optionOutputAmdBasePath = getString({
		available: optionOutputAmdAutoId.value,
		name: 'output.amd.basePath'
	});
	const optionOutputAmdDefine = getString({
		available: isAmdFormat,
		defaultValue: 'define',
		name: 'output.amd.define'
	});
	const optionOutputAmdForceJsExtensionForImports = getBoolean({
		available: isAmdFormat,
		name: 'output.amd.forceJsExtensionForImports'
	});
	const optionOutputAmdId = getString({
		available: () =>
			isAmdFormat.value && !outputHasMultipleChunks.value && !optionOutputAmdAutoId.value.value,
		name: 'output.amd.id',
		placeholder: 'leave blank for anonymous module'
	});
	const optionOutputBanner = getString({
		name: 'output.banner'
	});
	const optionOutputChunkFileNames = getString({
		available: alwaysTrue,
		defaultValue: '[name]-[hash].js',
		name: 'output.chunkFileNames'
	});
	const optionOutputCompact = getBoolean({
		name: 'output.compact'
	});
	const optionOutputDynamicImportInCjs = getBoolean({
		available: () => optionOutputFormat.value.value === 'cjs',
		defaultValue: true,
		name: 'output.dynamicImportInCjs'
	});
	const optionOutputEntryFileNames = getString({
		available: alwaysTrue,
		defaultValue: '[name].js',
		name: 'output.entryFileNames'
	});
	const optionOutputEsModule = getSelect({
		available: isInteropFormat,
		defaultValue: 'if-default-prop',
		name: 'output.esModule',
		options: () => [false, true, 'if-default-prop']
	});
	const optionOutputExperimentalMinChunkSize = getNumber({
		defaultValue: 0,
		name: 'output.experimentalMinChunkSize'
	});
	const optionOutputExports = getSelect({
		available: isInteropFormat,
		defaultValue: 'auto',
		name: 'output.exports',
		options: () => ['auto', 'default', 'named', 'none']
	});
	const optionOutputExtend = getBoolean({
		available: isIifeFormat,
		name: 'output.extend'
	});
	const optionOutputExternalLiveBindings = getBoolean({
		available: isInteropFormat,
		defaultValue: true,
		name: 'output.externalLiveBindings'
	});
	const optionOutputExternalImportAttributes = getBoolean({
		available: () => optionOutputFormat.value.value === 'es',
		defaultValue: true,
		name: 'output.externalImportAttributes'
	});
	const optionOutputFreeze = getBoolean({
		defaultValue: true,
		name: 'output.freeze'
	});
	const optionOutputFooter = getString({
		name: 'output.footer'
	});
	const optionOutputFormat = getSelect({
		defaultValue: 'es',
		name: 'output.format',
		options: () =>
			optionOutputPreserveModules.value.value === true || outputHasMultipleChunks.value
				? codeSplittingFormats
				: allFormats,
		required: () => true
	});
	const optionOutputGeneratedCodeArrowFunctions = getBoolean({
		name: 'output.generatedCode.arrowFunctions'
	});
	const optionOutputGeneratedCodeConstBindings = getBoolean({
		name: 'output.generatedCode.constBindings'
	});
	const optionOutputGeneratedCodeObjectShorthand = getBoolean({
		name: 'output.generatedCode.objectShorthand'
	});
	const optionOutputGeneratedCodePreset = getSelect({
		defaultValue: null,
		name: 'output.generatedCode.preset',
		options: () => [null, 'es5', 'es2015']
	});
	const optionOutputGeneratedCodeReservedNamesAsProperties = getBoolean({
		defaultValue: true,
		name: 'output.generatedCode.reservedNamesAsProps'
	});
	const optionOutputGeneratedCodeSymbols = getBoolean({
		name: 'output.generatedCode.symbols'
	});
	const optionOutputGlobals = getStringMapping({
		available: () => isIifeFormat.value && externalImports.value.length > 0,
		keys: externalImports,
		name: 'output.globals',
		required: () => true
	});
	const optionOutputHashCharacters = getSelect({
		defaultValue: 'base64',
		name: 'output.hashCharacters',
		options: () => ['base64', 'base36', 'hex']
	});
	const optionOutputHoistTransitiveImports = getBoolean({
		available: alwaysTrue,
		defaultValue: true,
		name: 'output.hoistTransitiveImports'
	});
	const optionOutputImportAttributesKey = getSelect({
		defaultValue: 'assert',
		name: 'output.importAttributesKey',
		options: () => ['with', 'assert']
	});
	const optionOutputIndent = getBoolean({
		available: () => ['amd', 'iife', 'umd', 'system'].includes(optionOutputFormat.value.value!),
		defaultValue: true,
		name: 'output.indent'
	});
	const optionOutputInlineDynamicImports = getBoolean({
		available: () => {
			const modules = modulesStore.modules;
			if (!modules) return false;
			let entryPoints = 0;
			for (const { isEntry } of modules) {
				if (isEntry) {
					entryPoints++;
					if (entryPoints > 1) {
						return false;
					}
				}
			}
			return true;
		},
		name: 'output.inlineDynamicImports'
	});
	const optionOutputInterop = getSelect({
		available: () => {
			const { value } = optionOutputFormat.value;
			return value != null && interopFormats.has(value);
		},
		defaultValue: 'default',
		name: 'output.interop',
		options: () => ['compat', 'auto', 'esModule', 'default', 'defaultOnly']
	});
	const optionOutputIntro = getString({
		name: 'output.intro'
	});
	const optionOutputMinifyInternalExports = getBoolean({
		available: alwaysTrue,
		name: 'output.minifyInternalExports'
	});
	const optionOutputNoConflict = getBoolean({
		available: () => optionOutputFormat.value.value === 'umd',
		name: 'output.noConflict'
	});
	const optionOutputName = getString({
		available: isIifeFormat,
		defaultValue: 'myBundle',
		name: 'output.name',
		required: () => rollupOutputStore.output.output[0]?.exports.length > 0
	});
	const optionOutputOutro = getString({
		name: 'output.outro'
	});
	const optionOutputPaths = getStringMapping({
		available: () => externalImports.value.length > 0 && optionOutputFormat.value.value !== 'iife',
		keys: externalImports,
		name: 'output.paths'
	});
	const optionOutputPreserveModules = getBoolean({
		available: () => {
			const { value } = optionOutputFormat.value;
			return value == null || codeSplittingFormats.includes(value);
		},
		name: 'output.preserveModules'
	});
	const optionOutputPreserveModulesRoot = getString({
		available: optionOutputPreserveModules.value,
		name: 'output.preserveModulesRoot'
	});
	const optionOutputReexportProtoFromExternal = getBoolean({
		available: () =>
			isInteropFormat.value && optionOutputExternalLiveBindings.value.value === false,
		defaultValue: true,
		name: 'output.reexportProtoFromExternal'
	});
	const optionOutputSanitizeFileName = getBoolean({
		available: alwaysTrue,
		defaultValue: true,
		name: 'output.sanitizeFileName'
	});
	const optionOutputSourcemap = getBoolean({
		name: 'output.sourcemap'
	});
	const optionOutputSourcemapBaseUrl = getString({
		available: optionOutputSourcemap.value,
		name: 'output.sourcemapBaseUrl'
	});
	const optionOutputSourcemapExcludeSources = getBoolean({
		available: optionOutputSourcemap.value,
		name: 'output.sourcemapExcludeSources'
	});
	const optionOutputSourcemapFileNames = getString({
		available: alwaysTrue,
		defaultValue: undefined,
		name: 'output.sourcemapFileNames'
	});
	const optionOutputStrict = getBoolean({
		available: () =>
			optionOutputFormat.value.value !== undefined && optionOutputFormat.value.value !== 'es',
		defaultValue: true,
		name: 'output.strict'
	});
	const optionOutputSystemNullSetters = getBoolean({
		available: () => optionOutputFormat.value.value === 'system',
		defaultValue: true,
		name: 'output.systemNullSetters'
	});
	const optionOutputValidate = getBoolean({
		name: 'output.validate'
	});
	const optionPreserveEntrySignatures = getSelect({
		available: alwaysTrue,
		defaultValue: 'exports-only',
		name: 'preserveEntrySignatures',
		options: () => ['strict', 'allow-extension', 'exports-only', false]
	});
	const optionShimMissingExports = getBoolean({
		defaultValue: false,
		name: 'shimMissingExports'
	});
	const optionTreeshake = getSelect({
		defaultValue: true,
		name: 'treeshake',
		options: () => [false, true, 'smallest', 'safest', 'recommended']
	});
	const optionTreeshakeAnnotations = getBoolean({
		available: isTreeshakeEnabled,
		defaultValue: true,
		name: 'treeshake.annotations'
	});
	const optionTreeshakeCorrectVariableValueBeforeDeclaration = getBoolean({
		available: isTreeshakeEnabled,
		defaultValue: false,
		name: 'treeshake.correctVarValueBeforeDeclaration'
	});
	const optionTreeshakeModuleSideEffects = getSelect({
		available: isTreeshakeEnabled,
		defaultValue: true,
		name: 'treeshake.moduleSideEffects',
		options: () => [false, true, 'no-external']
	});
	const optionTreeshakePreset = getSelect({
		available: isTreeshakeEnabled,
		defaultValue: null,
		name: 'treeshake.preset',
		options: () => [null, 'smallest', 'safest', 'recommended']
	});
	const optionTreeshakePropertyReadSideEffects = getSelect({
		available: isTreeshakeEnabled,
		defaultValue: true,
		name: 'treeshake.propertyReadSideEffects',
		options: () => [false, true, 'always']
	});
	const optionTreeshakeTryCatchDeoptimization = getBoolean({
		available: isTreeshakeEnabled,
		defaultValue: true,
		name: 'treeshake.tryCatchDeoptimization'
	});
	const optionTreeshakeUnknownGlobalSideEffects = getBoolean({
		available: isTreeshakeEnabled,
		defaultValue: true,
		name: 'treeshake.unknownGlobalSideEffects'
	});

	const optionList: OptionType[] = [
		optionContext,
		optionExperimentalLogSideEffects,
		optionOutputAmdAutoId,
		optionOutputAmdBasePath,
		optionOutputAmdDefine,
		optionOutputAmdForceJsExtensionForImports,
		optionOutputAmdId,
		optionOutputBanner,
		optionOutputChunkFileNames,
		optionOutputCompact,
		optionOutputDynamicImportInCjs,
		optionOutputEntryFileNames,
		optionOutputEsModule,
		optionOutputExperimentalMinChunkSize,
		optionOutputExports,
		optionOutputExtend,
		optionOutputExternalLiveBindings,
		optionOutputExternalImportAttributes,
		optionOutputFreeze,
		optionOutputFooter,
		optionOutputFormat,
		optionOutputGeneratedCodeArrowFunctions,
		optionOutputGeneratedCodeConstBindings,
		optionOutputGeneratedCodeObjectShorthand,
		optionOutputGeneratedCodePreset,
		optionOutputGeneratedCodeReservedNamesAsProperties,
		optionOutputGeneratedCodeSymbols,
		optionOutputGlobals,
		optionOutputHashCharacters,
		optionOutputHoistTransitiveImports,
		optionOutputImportAttributesKey,
		optionOutputIndent,
		optionOutputInlineDynamicImports,
		optionOutputInterop,
		optionOutputIntro,
		optionOutputMinifyInternalExports,
		optionOutputNoConflict,
		optionOutputName,
		optionOutputOutro,
		optionOutputPaths,
		optionOutputPreserveModules,
		optionOutputPreserveModulesRoot,
		optionOutputReexportProtoFromExternal,
		optionOutputSourcemap,
		optionOutputSourcemapFileNames,
		optionOutputSanitizeFileName,
		optionOutputSourcemapBaseUrl,
		optionOutputSourcemapExcludeSources,
		optionOutputStrict,
		optionOutputValidate,
		optionPreserveEntrySignatures,
		optionOutputSystemNullSetters,
		optionShimMissingExports,
		optionTreeshake,
		optionTreeshakeAnnotations,
		optionTreeshakeCorrectVariableValueBeforeDeclaration,
		optionTreeshakeModuleSideEffects,
		optionTreeshakePreset,
		optionTreeshakePropertyReadSideEffects,
		optionTreeshakeTryCatchDeoptimization,
		optionTreeshakeUnknownGlobalSideEffects
	];
	const options = computed<Option[]>(() =>
		optionList
			.filter(isOptionShown)
			.map((option: OptionType) => mapOptions[option.type](option as any))
	);

	return {
		additionalAvailableOptions: computed<string[]>(() =>
			optionList
				.filter(option => option.available.value && !isOptionShown(option))
				.map(({ name }) => name)
		),
		addOption(optionName: string) {
			const option = optionList.find(({ name }) => name === optionName)!;
			option.value.value = option.defaultValue;
		},
		options,
		optionsObject: getOptionsObject(options),
		set(name: string, value: any) {
			optionList.find(option => option.name === name)!.value.value = value;
		},
		setAll(options: RollupOptions) {
			for (const { name, value } of optionList) {
				const path = name.split('.');
				let key: string | undefined;
				let subOptions: any = options;
				while ((key = path.shift())) {
					subOptions = subOptions?.[key];
				}
				value.value = name === 'treeshake' && typeof subOptions === 'object' ? true : subOptions;
			}
		}
	};
});

function getBoolean({
	available,
	defaultValue,
	name
}: {
	available?: (() => boolean) | Ref<boolean | undefined>;
	defaultValue?: boolean;
	name: string;
}): OptionTypeSelect<boolean> {
	return getSelect({
		available,
		defaultValue: defaultValue || false,
		name,
		options: () => [false, true]
	});
}

function getSelect<T>({
	available,
	defaultValue,
	name,
	options,
	required
}: {
	available?: (() => boolean) | Ref<boolean | undefined>;
	defaultValue: T;
	name: string;
	options: () => T[];
	required?: () => boolean;
}): OptionTypeSelect<T> {
	return {
		available: typeof available === 'function' ? computed(available) : available || alwaysTrue,
		defaultValue,
		name,
		options: computed(options),
		required: required ? computed(required) : alwaysFalse,
		type: 'select',
		value: ref(undefined)
	};
}

function getString({
	available,
	defaultValue,
	name,
	placeholder,
	required
}: {
	available?: (() => boolean) | Ref<boolean | undefined>;
	defaultValue?: string;
	name: string;
	placeholder?: string;
	required?: () => boolean;
}): OptionTypeString {
	return {
		available: typeof available === 'function' ? computed(available) : available || alwaysTrue,
		defaultValue: defaultValue ?? '',
		name,
		placeholder: placeholder || null,
		required: required ? computed(required) : alwaysFalse,
		type: 'string',
		value: ref(undefined)
	};
}

function getStringMapping({
	available,
	keys,
	name,
	required
}: {
	available?: () => boolean;
	keys: Ref<string[]>;
	name: string;
	placeholder?: string;
	required?: () => boolean;
}): OptionTypeStringMapping {
	return {
		available: available ? computed(available) : alwaysTrue,
		defaultValue: {},
		keys,
		name,
		required: required ? computed(required) : alwaysFalse,
		type: 'string-mapping',
		value: shallowRef(undefined)
	};
}

function getNumber({
	available,
	defaultValue,
	name,
	placeholder,
	required
}: {
	available?: (() => boolean) | Ref<boolean | undefined>;
	defaultValue?: number;
	name: string;
	placeholder?: string;
	required?: () => boolean;
}): OptionTypeNumber {
	return {
		available: typeof available === 'function' ? computed(available) : available || alwaysTrue,
		defaultValue: defaultValue ?? 0,
		name,
		placeholder: placeholder || null,
		required: required ? computed(required) : alwaysFalse,
		type: 'number',
		value: ref(undefined)
	};
}

function getOptionsObject(options: Ref<Option[]>): Ref<RollupOptions> {
	let previousOptions = options.value.filter(({ value }) => value !== undefined);
	const result = shallowRef<RollupOptions>({});
	watchEffect(
		() => {
			const filteredOptions = options.value.filter(({ value }) => value !== undefined);
			if (
				filteredOptions.length === previousOptions.length &&
				filteredOptions.every(
					({ name, value }, index) =>
						name === previousOptions[index].name && value === previousOptions[index].value
				)
			) {
				return;
			}
			previousOptions = filteredOptions;
			const object = {};
			for (const { name, value } of filteredOptions) {
				const path = name.split('.');
				const valueKey = path.pop()!;
				let key: string | undefined;
				let subOptions: any = object;
				while ((key = path.shift())) {
					// Special logic to handle treeshake option
					if (subOptions[key] === true) {
						subOptions[key] = {};
					}
					subOptions = subOptions[key] ??= {};
				}
				subOptions[valueKey] = value;
			}
			result.value = object;
		},
		{ flush: 'post' }
	);
	return result;
}
