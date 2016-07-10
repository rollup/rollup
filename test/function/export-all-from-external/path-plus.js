export * from 'path';

export function isRelative ( path ) {
	return path[0] === '.';
}
