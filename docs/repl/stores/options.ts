import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref, shallowRef, watchEffect } from 'vue';
import type { OutputOptions } from '../../../src/rollup/types';
import { useRollupOutput } from './rollupOutput';

interface BaseOptionType<T> {
	available: Ref<boolean>;
	defaultValue: T;
	name: string;
	required: Ref<boolean>;
	type: string;
	value: Ref<T | undefined>;
}

interface OptionTypeBoolean extends BaseOptionType<boolean> {
	type: 'boolean';
}

interface OptionTypeStringSelect extends BaseOptionType<string> {
	options: Ref<string[]>;
	type: 'string-select';
}

interface OptionTypeString extends BaseOptionType<string> {
	placeholder: string | null;
	type: 'string';
}

interface OptionTypeStringMapping extends BaseOptionType<Record<string, string>> {
	keys: Ref<string[]>;
	type: 'string-mapping';
}

type OptionType =
	| OptionTypeBoolean
	| OptionTypeString
	| OptionTypeStringSelect
	| OptionTypeStringMapping;

const mapOptions = {
	boolean({ defaultValue, name, value }: OptionTypeBoolean) {
		return {
			name,
			type: 'boolean',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	},
	string({ defaultValue, name, placeholder, value }: OptionTypeString) {
		return {
			name,
			placeholder,
			type: 'string',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	},
	'string-mapping'({ defaultValue, keys, name, value }: OptionTypeStringMapping) {
		return {
			keys: keys.value,
			name,
			type: 'string-mapping',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	},
	'string-select'({ defaultValue, name, options, value }: OptionTypeStringSelect) {
		return {
			name,
			options: options.value,
			type: 'string-select',
			value:
				value.value === undefined || !options.value.includes(value.value)
					? defaultValue
					: value.value
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

const isOptionShown = ({ required, available, value }: OptionType): boolean =>
	available.value && (required.value || value.value !== undefined);

export const useOptions = defineStore('options2', () => {
	const rollupOutputStore = useRollupOutput();

	const optionOutputFormat: OptionTypeStringSelect = {
		available: alwaysTrue,
		defaultValue: 'es',
		name: 'output.format',
		options: computed(() =>
			optionOutputPreserveModules.value.value === true ? codeSplittingFormats : allFormats
		),
		required: alwaysTrue,
		type: 'string-select',
		value: ref(undefined)
	};
	const optionOutputPreserveModules: OptionTypeBoolean = {
		available: computed(
			() =>
				optionOutputFormat.value.value === undefined ||
				codeSplittingFormats.includes(optionOutputFormat.value.value)
		),
		defaultValue: false,
		name: 'output.preserveModules',
		required: alwaysFalse,
		type: 'boolean',
		value: ref(undefined)
	};
	const optionOutputAmdId: OptionTypeString = {
		available: computed(
			() =>
				optionOutputFormat.value.value !== undefined &&
				amdFormats.has(optionOutputFormat.value.value)
		),
		defaultValue: '',
		name: 'output.amd.id',
		placeholder: 'leave blank for anonymous module',
		required: alwaysFalse,
		type: 'string',
		value: ref(undefined)
	};
	const optionOutputName: OptionTypeString = {
		available: computed(
			() =>
				optionOutputFormat.value.value !== undefined &&
				iifeFormats.has(optionOutputFormat.value.value)
		),
		defaultValue: '',
		name: 'output.name',
		placeholder: null,
		required: eagerComputed(() => rollupOutputStore.output?.output[0]?.exports.length > 0),
		type: 'string',
		value: ref(undefined)
	};

	// TODO Lukas create helpers to create those
	const optionOutputGlobals: OptionTypeStringMapping = {
		available: eagerComputed(
			() =>
				optionOutputFormat.value.value !== undefined &&
				iifeFormats.has(optionOutputFormat.value.value) &&
				optionOutputGlobals.keys.value.length > 0
		),
		defaultValue: {},
		keys: eagerComputed(() => {
			const output = rollupOutputStore.output?.output;
			if (!output || output.length === 0) return [];
			return output[0].imports.sort((a, b) => (a < b ? -1 : 1));
		}),
		name: 'output.globals',
		required: alwaysTrue,
		type: 'string-mapping',
		value: shallowRef(undefined)
	};

	const optionList: OptionType[] = [
		optionOutputFormat,
		optionOutputPreserveModules,
		optionOutputAmdId,
		optionOutputName,
		optionOutputGlobals
	];

	const options = eagerComputed<Option[]>(() =>
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
		setAll(options: OutputOptions) {
			for (const { name, value } of optionList) {
				const path = name.slice('output.'.length).split('.');
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

function eagerComputed<T>(getValue: () => T): Ref<T> {
	const result = shallowRef();
	watchEffect(
		() => {
			const newValue = getValue();
			if (newValue !== result.value) {
				console.log('change', newValue, result.value);
				result.value = newValue;
			}
		},
		{ flush: 'sync' }
	);
	return result;
}

function getOptionsObject(options: Ref<Option[]>): Ref<OutputOptions> {
	let previousOptions = options.value.filter(({ value }) => value !== undefined);
	const result = shallowRef<OutputOptions>({});
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
				const path = name.slice('output.'.length).split('.');
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
