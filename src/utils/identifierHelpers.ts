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
