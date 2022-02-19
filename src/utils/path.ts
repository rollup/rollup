const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|/])/;
const relativePath = /^\.?\.\//;

export function isAbsolute(path: string): boolean {
	return absolutePath.test(path);
}

export function isRelative(path: string): boolean {
	return relativePath.test(path);
}

export function normalize(path: string): string {
	return path.includes('\\') ? path.replace(/\\/g, '/') : path;
}

export { basename, dirname, extname, relative, resolve } from 'path';
