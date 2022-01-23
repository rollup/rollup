import {
	InputOptions,
	NormalizedGeneratedCodeOptions,
	NormalizedOutputOptions,
	NormalizedTreeshakingOptions,
	OutputOptions,
	WarningHandler
} from '../../rollup/types';
import { errInvalidOption, error } from '../error';
import { printQuotedStringList } from '../printStringList';

export interface GenericConfigObject {
	[key: string]: unknown;
}

export const defaultOnWarn: WarningHandler = warning => console.warn(warning.message || warning);

export function warnUnknownOptions(
	passedOptions: GenericConfigObject,
	validOptions: string[],
	optionType: string,
	warn: WarningHandler,
	ignoredKeys = /$./
): void {
	const validOptionSet = new Set(validOptions);
	const unknownOptions = Object.keys(passedOptions).filter(
		key => !(validOptionSet.has(key) || ignoredKeys.test(key))
	);
	if (unknownOptions.length > 0) {
		warn({
			code: 'UNKNOWN_OPTION',
			message: `Unknown ${optionType}: ${unknownOptions.join(', ')}. Allowed options: ${[
				...validOptionSet
			]
				.sort()
				.join(', ')}`
		});
	}
}

type ObjectValue<Base> = Base extends Record<string, any> ? Base : never;

export const treeshakePresets: {
	[key in NonNullable<
		ObjectValue<InputOptions['treeshake']>['preset']
	>]: NormalizedTreeshakingOptions;
} = {
	recommended: {
		annotations: true,
		correctVarValueBeforeDeclaration: false,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: false
	},
	safest: {
		annotations: true,
		correctVarValueBeforeDeclaration: true,
		moduleSideEffects: () => true,
		propertyReadSideEffects: true,
		tryCatchDeoptimization: true,
		unknownGlobalSideEffects: true
	},
	smallest: {
		annotations: true,
		correctVarValueBeforeDeclaration: false,
		moduleSideEffects: () => false,
		propertyReadSideEffects: false,
		tryCatchDeoptimization: false,
		unknownGlobalSideEffects: false
	}
};

export const generatedCodePresets: {
	[key in NonNullable<
		ObjectValue<OutputOptions['generatedCode']>['preset']
	>]: NormalizedOutputOptions['generatedCode'];
} = {
	es2015: {
		arrowFunctions: true,
		constBindings: true,
		objectShorthand: true,
		reservedNamesAsProps: true
	},
	es5: {
		arrowFunctions: false,
		constBindings: false,
		objectShorthand: false,
		reservedNamesAsProps: true
	}
};

type ObjectOptionWithPresets =
	| Partial<NormalizedTreeshakingOptions>
	| Partial<NormalizedGeneratedCodeOptions>;

export const objectifyOption = (value: unknown): Record<string, unknown> =>
	value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

export const objectifyOptionWithPresets =
	<T extends ObjectOptionWithPresets>(
		presets: Record<string, T>,
		optionName: string,
		additionalValues: string
	) =>
	(value: unknown): Record<string, unknown> => {
		if (typeof value === 'string') {
			const preset = presets[value];
			if (preset) {
				return preset;
			}
			error(
				errInvalidOption(
					optionName,
					getHashFromObjectOption(optionName),
					`valid values are ${additionalValues}${printQuotedStringList(
						Object.keys(presets)
					)}. You can also supply an object for more fine-grained control`,
					value
				)
			);
		}
		return objectifyOption(value);
	};

export const getOptionWithPreset = <T extends ObjectOptionWithPresets>(
	value: unknown,
	presets: Record<string, T>,
	optionName: string,
	additionalValues: string
): Record<string, unknown> => {
	const presetName: string | undefined = (value as any)?.preset;
	if (presetName) {
		const preset = presets[presetName];
		if (preset) {
			return { ...preset, ...(value as Record<string, unknown>) };
		} else {
			error(
				errInvalidOption(
					`${optionName}.preset`,
					getHashFromObjectOption(optionName),
					`valid values are ${printQuotedStringList(Object.keys(presets))}`,
					presetName
				)
			);
		}
	}
	return objectifyOptionWithPresets(presets, optionName, additionalValues)(value);
};

const getHashFromObjectOption = (optionName: string): string =>
	optionName.split('.').join('').toLowerCase();
