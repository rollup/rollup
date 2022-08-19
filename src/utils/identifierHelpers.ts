import RESERVED_NAMES from './RESERVED_NAMES';

const illegalCharacters = /[^$_a-zA-Z0-9]/g;

const startsWithDigit = (str: string): boolean => /\d/.test(str[0]);

const needsEscape = (str: string) =>
	startsWithDigit(str) || RESERVED_NAMES.has(str) || str === 'arguments';

export function isLegal(str: string): boolean {
	if (needsEscape(str)) {
		return false;
	}
	return !illegalCharacters.test(str);
}

export function makeLegal(str: string): string {
	str = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(illegalCharacters, '_');

	if (needsEscape(str)) str = `_${str}`;

	return str || '_';
}
