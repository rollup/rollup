import RESERVED_NAMES from './RESERVED_NAMES';

const illegalCharacters = /[^\w$]/g;

const startsWithDigit = (value: string): boolean => /\d/.test(value[0]);

const needsEscape = (value: string) =>
	startsWithDigit(value) || RESERVED_NAMES.has(value) || value === 'arguments';

export function isLegal(value: string): boolean {
	if (needsEscape(value)) {
		return false;
	}
	return !illegalCharacters.test(value);
}

export function makeLegal(value: string): string {
	value = value
		.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())
		.replace(illegalCharacters, '_');

	if (needsEscape(value)) value = `_${value}`;

	return value || '_';
}

export const VALID_IDENTIFIER_REGEXP = /^[$_\p{ID_Start}][$\u200C\u200D\p{ID_Continue}]*$/u;
export const NUMBER_REGEXP = /^\d+$/;

export function stringifyObjectKeyIfNeeded(key: string) {
	if (VALID_IDENTIFIER_REGEXP.test(key) || NUMBER_REGEXP.test(key)) {
		return key === '__proto__' ? '["__proto__"]' : key;
	}
	return JSON.stringify(key);
}

export function stringifyIdentifierIfNeeded(key: string) {
	if (VALID_IDENTIFIER_REGEXP.test(key)) {
		return key;
	}
	return JSON.stringify(key);
}
