import { UNKNOWN_ASSIGNMENT } from '../values';

export interface UnknownKey {
	type: 'UNKNOWN_KEY';
};

export const UNKNOWN_KEY: UnknownKey = { type: 'UNKNOWN_KEY' };

class ReassignedPathTracker {
	constructor () {
		this._reassigned = false;
		this._unknownReassignedSubPath = false;
		this._subPaths = new Map();
	}

	isReassigned (path) {
		if (path.length === 0) {
			return this._reassigned;
		}
		const [subPath, ...remainingPath] = path;
		return (
			this._unknownReassignedSubPath ||
			(this._subPaths.has(subPath) &&
				this._subPaths.get(subPath).isReassigned(remainingPath))
		);
	}

	reassignPath (path) {
		if (this._reassigned) return;
		if (path.length === 0) {
			this._reassigned = true;
		} else {
			this._reassignSubPath(path);
		}
	}

	_reassignSubPath (path) {
		if (this._unknownReassignedSubPath) return;
		const [subPath, ...remainingPath] = path;
		if (subPath === UNKNOWN_KEY) {
			this._unknownReassignedSubPath = true;
		} else {
			if (!this._subPaths.has(subPath)) {
				this._subPaths.set(subPath, new ReassignedPathTracker());
			}
			this._subPaths.get(subPath).reassignPath(remainingPath);
		}
	}

	someReassignedPath (path, callback) {
		return this._reassigned
			? callback(path, UNKNOWN_ASSIGNMENT)
			: path.length >= 1 && this._onSubPathIfReassigned(path, callback);
	}

	_onSubPathIfReassigned (path, callback) {
		const [subPath, ...remainingPath] = path;
		return this._unknownReassignedSubPath || subPath === UNKNOWN_KEY
			? callback(remainingPath, UNKNOWN_ASSIGNMENT)
			: this._subPaths.has(subPath) &&
			this._subPaths
				.get(subPath)
				.someReassignedPath(remainingPath, callback);
	}
}

export default class VariableReassignmentTracker {
	constructor (initialExpression) {
		this._initialExpression = initialExpression;
		this._reassignedPathTracker = new ReassignedPathTracker();
	}

	reassignPath (path, options) {
		if (path.length > 0) {
			this._initialExpression &&
				this._initialExpression.reassignPath(path, options);
		}
		this._reassignedPathTracker.reassignPath(path, options);
	}

	forEachAtPath (path, callback) {
		this._initialExpression && callback(path, this._initialExpression);
	}

	someAtPath (path, predicateFunction) {
		return (
			this._reassignedPathTracker.someReassignedPath(path, predicateFunction) ||
			(this._initialExpression &&
				predicateFunction(path, this._initialExpression))
		);
	}
}
