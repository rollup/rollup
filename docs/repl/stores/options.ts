import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref, shallowRef, watchEffect } from 'vue';
import type { RollupOptions } from '../../../src/rollup/types';
import { useModules } from './modules';
import { useRollupOutput } from './rollupOutput';

interface BaseOptionType<T> {
	available: Ref<boolean>;
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

type OptionType = OptionTypeSelect<unknown> | OptionTypeString | OptionTypeStringMapping;

const mapOptions = {
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

const isOptionShown = ({ required, available, value }: OptionType): boolean =>
	available.value && (required.value || value.value !== undefined);

// TODO Lukas add more reasonable options to examples
export const useOptions = defineStore('options2', () => {
	const rollupOutputStore = useRollupOutput();
	const modulesStore = useModules();

	const outputHasMultipleChunks = computed(() => rollupOutputStore.output?.output.length > 1);
	const isIifeFormat = computed(() => {
		const { value } = optionOutputFormat.value;
		return value != null && iifeFormats.has(value);
	});
	const externalImports = computed(() => rollupOutputStore.output?.externalImports || []);

	const optionOutputAmdId = getString({
		available: () => {
			const { value } = optionOutputFormat.value;
			return value != null && amdFormats.has(value);
		},
		name: 'output.amd.id',
		placeholder: 'leave blank for anonymous module'
	});
	const optionOutputBanner = getString({
		name: 'output.banner'
	});
	const optionOutputChunkFileNames = getString({
		available: outputHasMultipleChunks,
		defaultValue: '[name]-[hash].js',
		name: 'output.chunkFileNames'
	});
	const optionOutputCompact = getBoolean({
		name: 'output.compact'
	});
	const optionOutputDynamicImportInCjs = getBoolean({
		available: () => optionOutputFormat.value.value === 'cjs',
		name: 'output.dynamicImportInCjs'
	});
	const optionOutputEntryFileNames = getString({
		available: outputHasMultipleChunks,
		defaultValue: '[name].js',
		name: 'output.entryFileNames'
	});
	const optionOutputExtend = getBoolean({
		available: isIifeFormat,
		name: 'output.extend'
	});
	const optionOutputExternalImportAssertions = getBoolean({
		available: () => optionOutputFormat.value.value === 'es',
		name: 'output.externalImportAssertions'
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
	const optionOutputHoistTransitiveImports = getBoolean({
		available: outputHasMultipleChunks,
		name: 'output.hoistTransitiveImports'
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
		available: outputHasMultipleChunks,
		name: 'output.minifyInternalExports'
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
			return value != null && codeSplittingFormats.includes(value);
		},
		name: 'output.preserveModules'
	});
	const optionTreeshake = getBoolean({
		name: 'treeshake'
	});

	const optionList: OptionType[] = [
		optionOutputAmdId,
		optionOutputBanner,
		optionOutputChunkFileNames,
		optionOutputCompact,
		optionOutputDynamicImportInCjs,
		optionOutputEntryFileNames,
		optionOutputExtend,
		optionOutputExternalImportAssertions,
		optionOutputFooter,
		optionOutputFormat,
		optionOutputGeneratedCodeArrowFunctions,
		optionOutputGeneratedCodeConstBindings,
		optionOutputGeneratedCodeObjectShorthand,
		optionOutputGeneratedCodePreset,
		optionOutputGeneratedCodeReservedNamesAsProperties,
		optionOutputGeneratedCodeSymbols,
		optionOutputGlobals,
		optionOutputHoistTransitiveImports,
		optionOutputInlineDynamicImports,
		optionOutputInterop,
		optionOutputIntro,
		optionOutputMinifyInternalExports,
		optionOutputName,
		optionOutputOutro,
		optionOutputPaths,
		optionOutputPreserveModules,
		optionTreeshake
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
				value.value = subOptions;
			}
		}
	};
});

function getBoolean({
	available,
	defaultValue,
	name
}: {
	available?: (() => boolean) | Ref<boolean>;
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
	available?: (() => boolean) | Ref<boolean>;
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
	available?: (() => boolean) | Ref<boolean>;
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
