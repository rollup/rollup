import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref, shallowRef, watchEffect } from 'vue';
import type { OutputOptions } from '../../../src/rollup/types';
import { useRollupOutput } from './rollupOutput';

interface BaseOptionType<T> {
	available: Ref<boolean>;
	defaultValue: T | undefined;
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

	const optionOutputFormat = getStringSelect({
		defaultValue: 'es',
		name: 'output.format',
		options: () =>
			optionOutputPreserveModules.value.value === true ? codeSplittingFormats : allFormats,
		required: () => true
	});
	const optionOutputPreserveModules = getBoolean({
		available: () =>
			optionOutputFormat.value.value !== undefined &&
			amdFormats.has(optionOutputFormat.value.value),
		defaultValue: false,
		name: 'output.preserveModules'
	});
	const optionOutputAmdId = getString({
		available: () =>
			optionOutputFormat.value.value !== undefined &&
			amdFormats.has(optionOutputFormat.value.value),
		defaultValue: '',
		name: 'output.amd.id',
		placeholder: 'leave blank for anonymous module'
	});
	const optionOutputName = getString({
		available: () =>
			optionOutputFormat.value.value !== undefined &&
			iifeFormats.has(optionOutputFormat.value.value),
		defaultValue: 'myBundle',
		name: 'output.name',
		required: () => {
			console.log(rollupOutputStore.output.error?.code);
			return rollupOutputStore.output.output[0]?.exports.length > 0;
		}
	});
	const optionOutputGlobals = getStringMapping({
		available: () =>
			optionOutputFormat.value.value !== undefined &&
			iifeFormats.has(optionOutputFormat.value.value) &&
			optionOutputGlobals.keys.value.length > 0,
		keys: () => {
			const output = rollupOutputStore.output.output;
			if (!output || output.length === 0) return [];
			return output[0].imports.sort((a, b) => (a < b ? -1 : 1));
		},
		name: 'output.globals',
		required: () => true
	});

	// TODO Lukas select styling
	// TODO Lukas remove button
	// TODO Lukas more options
	const optionList: OptionType[] = [
		optionOutputFormat,
		optionOutputPreserveModules,
		optionOutputAmdId,
		optionOutputName,
		optionOutputGlobals
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

function getStringSelect({
	defaultValue,
	name,
	options,
	required
}: {
	defaultValue?: string;
	name: string;
	options: () => string[];
	required?: () => boolean;
}): OptionTypeStringSelect {
	return {
		available: alwaysTrue,
		defaultValue,
		name,
		options: computed(options),
		required: required ? computed(required) : alwaysFalse,
		type: 'string-select',
		value: ref(undefined)
	};
}

function getBoolean({
	available,
	defaultValue,
	name
}: {
	available?: () => boolean;
	defaultValue?: boolean;
	name: string;
}): OptionTypeBoolean {
	return {
		available: available ? computed(available) : alwaysTrue,
		defaultValue,
		name,
		required: alwaysFalse,
		type: 'boolean',
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
	available?: () => boolean;
	defaultValue?: string;
	name: string;
	placeholder?: string;
	required?: () => boolean;
}): OptionTypeString {
	return {
		available: available ? computed(available) : alwaysTrue,
		defaultValue,
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
	keys: () => string[];
	name: string;
	placeholder?: string;
	required?: () => boolean;
}): OptionTypeStringMapping {
	return {
		available: available ? computed(available) : alwaysTrue,
		defaultValue: {},
		keys: computed(keys),
		name,
		required: required ? computed(required) : alwaysFalse,
		type: 'string-mapping',
		value: shallowRef(undefined)
	};
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
