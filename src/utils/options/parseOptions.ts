import { WarningHandler, WarningHandlerWithDefault } from '../../rollup/types';

export interface GenericConfigObject {
	[key: string]: unknown;
}

// TODO Lukas inline
export const createGetOption = (config: GenericConfigObject, overrides: GenericConfigObject) => (
	name: string,
	defaultValue?: unknown
): any => overrides[name] ?? config[name] ?? defaultValue;

export const normalizeObjectOptionValue = (optionValue: any) => {
	if (!optionValue) {
		return optionValue;
	}
	if (typeof optionValue !== 'object') {
		return {};
	}
	return optionValue;
};

export const defaultOnWarn: WarningHandler = warning => {
	if (typeof warning === 'string') {
		console.warn(warning);
	} else {
		console.warn(warning.message);
	}
};

export const getOnWarn = (
	config: GenericConfigObject,
	defaultOnWarnHandler: WarningHandler
): WarningHandler =>
	config.onwarn
		? warning => (config.onwarn as WarningHandlerWithDefault)(warning, defaultOnWarnHandler)
		: defaultOnWarnHandler;

export function warnUnknownOptions(
	passedOptions: GenericConfigObject,
	validOptions: string[],
	optionType: string,
	warn: WarningHandler,
	ignoredKeys: RegExp = /$./
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
