const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
const relativePath = /^\.?\.\//;

export function isAbsolute(path: string): boolean {
	return absolutePath.test(path);
}

export function isRelative(path: string): boolean {
	return relativePath.test(path);
}

export function normalize(path: string): string {
	if (path.indexOf('\\') == -1) return path;
	return path.replace(/\\/g, '/');
}

export { basename, dirname, extname, relative, resolve } from 'path';
