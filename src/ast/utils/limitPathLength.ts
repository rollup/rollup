import type { ObjectPath } from './PathTracker';

// To avoid infinite recursions
export const MAX_PATH_DEPTH = 6;

// If a path is longer than MAX_PATH_DEPTH, it is truncated so that it is at
// most MAX_PATH_DEPTH long. The last element is always UnknownKey
export const limitPathDepth = (path: ObjectPath): ObjectPath =>
	path.length > MAX_PATH_DEPTH ? [...path.slice(0, MAX_PATH_DEPTH - 1), 'UnknownKey'] : path;

// If a path is longer than MAX_PATH_DEPTH, it is truncated so that it is at
// most MAX_PATH_DEPTH long. The last element is always UnknownKey
export const limitConcatenatedPathDepth = (path1: ObjectPath, path2: ObjectPath): ObjectPath => {
	const { length: length1 } = path1;
	const { length: length2 } = path2;
	return length1 === 0
		? path2
		: length2 === 0
			? path1
			: length1 + length2 > MAX_PATH_DEPTH
				? [...path1, ...path2.slice(0, MAX_PATH_DEPTH - 1 - path1.length), 'UnknownKey']
				: [...path1, ...path2];
};
