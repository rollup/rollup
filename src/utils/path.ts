export const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
export const relativePath = /^\.?\.\//;

export function isAbsolute(path: string) {
	return absolutePath.test(path);
}

export function isRelative(path: string) {
	return relativePath.test(path);
}

export function normalize(path: string) {
	if (path.indexOf('\\') == -1) return path;
	return path.replace(/\\/g, '/');
}

export { basename, dirname, extname, relative, resolve } from 'path';
