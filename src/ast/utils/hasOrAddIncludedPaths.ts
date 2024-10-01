import { type ObjectPath, UnknownKey } from './PathTracker';

export function hasOrAddIncludedPaths(includedPaths: Set<ObjectPath>, path: ObjectPath): boolean {
	for (const includedPath of includedPaths) {
		if (
			(path[0] === includedPath[0] && path[0] === UnknownKey) ||
			(path.length === includedPath.length &&
				path.every((key, index) => key === includedPath[index]))
		) {
			return true;
		}
	}
	includedPaths.add(path);
	return false;
}
