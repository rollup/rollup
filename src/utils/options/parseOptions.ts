import { WarningHandler } from '../../rollup/types';

export interface GenericConfigObject {
	[key: string]: unknown;
}

export const createGetOption = (config: GenericConfigObject, overrides: GenericConfigObject) => (
	name: string,
	defaultValue?: unknown
): any => overrides[name] ?? config[name] ?? defaultValue;

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
