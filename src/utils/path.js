// TODO does this all work on windows?

export const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/;
export const relativePath = /^\.?\.\//;

export function isAbsolute ( path ) {
	return absolutePath.test( path );
}

export function isRelative ( path ) {
	return relativePath.test( path );
}

export function normalize ( path ) {
	return path.replace( /\\/g, '/' );
}

export { basename, dirname, extname, relative, resolve } from 'path';
