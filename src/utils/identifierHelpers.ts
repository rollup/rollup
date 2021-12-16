import BUILTINS from './BUILTINS';
import RESERVED_WORDS from './RESERVED_WORDS';

const blacklisted = new Set([...RESERVED_WORDS, ...BUILTINS]);

const illegalCharacters = /[^$_a-zA-Z0-9]/g;

const startsWithDigit = (str: string) => /\d/.test(str[0]);

export function isLegal(str: string): boolean {
	if (startsWithDigit(str) || blacklisted.has(str)) {
		return false;
	}
	return !illegalCharacters.test(str);
}

export function makeLegal(str: string): string {
	str = str.replace(/-(\w)/g, (_, letter) => letter.toUpperCase()).replace(illegalCharacters, '_');

	if (startsWithDigit(str) || blacklisted.has(str)) str = `_${str}`;

	return str || '_';
}
