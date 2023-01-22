import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import type { OutputOptions } from '../../../src/rollup/types';

interface BaseOptionType<T> {
	available: Ref<boolean>;
	defaultValue: T;
	name: string;
	required: Ref<boolean>;
	type: string;
	value: Ref<T | undefined>;
}

interface OptionTypeStringSelect extends BaseOptionType<string> {
	options: Ref<string[]>;
	type: 'string-select';
}

interface OptionTypeBoolean extends BaseOptionType<boolean> {
	type: 'boolean';
}

type OptionType = OptionTypeStringSelect | OptionTypeBoolean;

const mapOptions = {
	boolean({ defaultValue, name, value }: OptionTypeBoolean) {
		return {
			name,
			type: 'boolean',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	},
	'string-select'({ defaultValue, name, options, value }: OptionTypeStringSelect) {
		return {
			name,
			options: options.value,
			type: 'string-select',
			value: value.value === undefined ? defaultValue : value.value
		} as const;
	}
};

type Option = ReturnType<(typeof mapOptions)[keyof typeof mapOptions]>;

const alwaysTrue = computed(() => true);
const alwaysFalse = computed(() => false);

const allFormats = ['es', 'amd', 'cjs', 'iife', 'umd', 'system'];
const codeSplittingFormats = ['es', 'amd', 'cjs', 'system'];

const isOptionShown = ({ required, available, value }: OptionType): boolean =>
	required.value || (available.value && value.value !== undefined);

export const useOptions2 = defineStore('options2', () => {
	const optionFormat: OptionTypeStringSelect = {
		available: alwaysTrue,
		defaultValue: 'es',
		name: 'output.format',
		options: computed(() =>
			optionPreserveModules.value.value === true ? codeSplittingFormats : allFormats
		),
		required: alwaysTrue,
		type: 'string-select',
		value: ref(undefined)
	};
	const optionPreserveModules: OptionTypeBoolean = {
		available: computed(
			() =>
				optionFormat.value.value === undefined ||
				codeSplittingFormats.includes(optionFormat.value.value)
		),
		defaultValue: false,
		name: 'output.preserveModules',
		required: alwaysFalse,
		type: 'boolean',
		value: ref(undefined)
	};

	const optionList: OptionType[] = [optionFormat, optionPreserveModules];

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
		options: computed<Option[]>(() =>
			optionList
				.filter(isOptionShown)
				.map((option: OptionType) => mapOptions[option.type](option as any))
		),
		set(name: string, value: any) {
			optionList.find(option => option.name === name)!.value.value = value;
		}
	};
});

export const useOptions = defineStore('options', () => {
	const options = ref<OutputOptions>({
		amd: { id: '' },
		format: 'es',
		globals: {},
		name: 'myBundle'
	});
	return {
		options,
		set(value: OutputOptions) {
			options.value = value as any;
		}
	};
});
