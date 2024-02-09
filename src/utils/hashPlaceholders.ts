import { toBase64 } from './base64';
import { error, logFailedValidation } from './logs';

// Four random characters from the private use area to minimize risk of
// conflicts
const hashPlaceholderLeft = '!~{';
const hashPlaceholderRight = '}~';
const hashPlaceholderOverhead = hashPlaceholderLeft.length + hashPlaceholderRight.length;

// This is the size of a 128-bits xxhash with base64url encoding
const MAX_HASH_SIZE = 22;
export const DEFAULT_HASH_SIZE = 8;

export type HashPlaceholderGenerator = (optionName: string, hashSize: number) => string;

export const getHashPlaceholderGenerator = (): HashPlaceholderGenerator => {
	let nextIndex = 0;
	return (optionName, hashSize) => {
		if (hashSize > MAX_HASH_SIZE) {
			return error(
				logFailedValidation(
					`Hashes cannot be longer than ${MAX_HASH_SIZE} characters, received ${hashSize}. Check the "${optionName}" option.`
				)
			);
		}
		const placeholder = `${hashPlaceholderLeft}${toBase64(++nextIndex).padStart(
			hashSize - hashPlaceholderOverhead,
			'0'
		)}${hashPlaceholderRight}`;
		if (placeholder.length > hashSize) {
			return error(
				logFailedValidation(
					`To generate hashes for this number of chunks (currently ${nextIndex}), you need a minimum hash size of ${placeholder.length}, received ${hashSize}. Check the "${optionName}" option.`
				)
			);
		}
		return placeholder;
	};
};

const REPLACER_REGEX = new RegExp(
	`${hashPlaceholderLeft}[0-9a-zA-Z_$]{1,${
		MAX_HASH_SIZE - hashPlaceholderOverhead
	}}${hashPlaceholderRight}`,
	'g'
);

export const replacePlaceholders = (
	code: string,
	hashesByPlaceholder: Map<string, string>
): string =>
	code.replace(REPLACER_REGEX, placeholder => hashesByPlaceholder.get(placeholder) || placeholder);

export const replaceSinglePlaceholder = (
	code: string,
	placeholder: string,
	value: string
): string => code.replace(REPLACER_REGEX, match => (match === placeholder ? value : match));

export const replacePlaceholdersWithDefaultAndGetContainedPlaceholders = (
	code: string,
	placeholders: Set<string>
): { containedPlaceholders: Set<string>; transformedCode: string } => {
	const containedPlaceholders = new Set<string>();
	const transformedCode = code.replace(REPLACER_REGEX, placeholder => {
		if (placeholders.has(placeholder)) {
			containedPlaceholders.add(placeholder);
			return `${hashPlaceholderLeft}${'0'.repeat(
				placeholder.length - hashPlaceholderOverhead
			)}${hashPlaceholderRight}`;
		}
		return placeholder;
	});
	return { containedPlaceholders, transformedCode };
};
