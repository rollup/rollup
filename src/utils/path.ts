const ABSOLUTE_PATH_REGEX = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
const RELATIVE_PATH_REGEX = /^\.?\.\//;

export function isAbsolute(path: string): boolean {
	return ABSOLUTE_PATH_REGEX.test(path);
}

export function isRelative(path: string): boolean {
	return RELATIVE_PATH_REGEX.test(path);
}

const BACKSLASH_REGEX = /\\/g;

export function normalize(path: string): string {
	return path.replace(BACKSLASH_REGEX, '/');
}

export { basename, dirname, extname, relative, resolve } from 'path';
