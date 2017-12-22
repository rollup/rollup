import { UNKNOWN_ASSIGNMENT, UnknownAssignment } from '../values';
import Expression from '../nodes/Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Declaration from '../nodes/Declaration';

export interface UnknownKey {
	type: 'UNKNOWN_KEY';
}

export type ObjectPath = (string | UnknownKey)[];

export const UNKNOWN_KEY: UnknownKey = { type: 'UNKNOWN_KEY' };

type PathCallback = (path: ObjectPath, expression: Expression | Declaration | UnknownAssignment) => void;
type PathPredicate = (path: ObjectPath, expression: Expression | Declaration | UnknownAssignment) => boolean;

class ReassignedPathTracker {
	_reassigned: boolean;
	_unknownReassignedSubPath: boolean;
	_subPaths: Map<string, ReassignedPathTracker>;

	constructor () {
		this._reassigned = false;
		this._unknownReassignedSubPath = false;
		this._subPaths = new Map();
	}

	isReassigned (path: string[]): boolean {
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

	reassignPath (path: ObjectPath) {
		if (this._reassigned) return;
		if (path.length === 0) {
			this._reassigned = true;
		} else {
			this._reassignSubPath(path);
		}
	}

	_reassignSubPath (path: ObjectPath) {
		if (this._unknownReassignedSubPath) return;
		const [subPath, ...remainingPath] = path;
		if (subPath === UNKNOWN_KEY) {
			this._unknownReassignedSubPath = true;
		} else {
			if (!this._subPaths.has(<string>subPath)) {
				this._subPaths.set(<string>subPath, new ReassignedPathTracker());
			}
			this._subPaths.get(<string>subPath).reassignPath(remainingPath);
		}
	}

	someReassignedPath (path: ObjectPath, callback: PathPredicate): boolean {
		return this._reassigned
			? callback(path, UNKNOWN_ASSIGNMENT)
			: path.length >= 1 && this._onSubPathIfReassigned(path, callback);
	}

	_onSubPathIfReassigned (path: ObjectPath, callback: PathPredicate): boolean {
		const [subPath, ...remainingPath] = path;
		return this._unknownReassignedSubPath || subPath === UNKNOWN_KEY
			? callback(remainingPath, UNKNOWN_ASSIGNMENT)
			: this._subPaths.has(<string>subPath) &&
			this._subPaths
				.get(<string>subPath)
				.someReassignedPath(remainingPath, callback);
	}
}

export default class VariableReassignmentTracker {
	private _initialExpression: Expression | Declaration | UnknownAssignment;
	private _reassignedPathTracker: ReassignedPathTracker;

	constructor (initialExpression: Expression | Declaration | UnknownAssignment) {
		this._initialExpression = initialExpression;
		this._reassignedPathTracker = new ReassignedPathTracker();
	}

	reassignPath (path: string[], options: ExecutionPathOptions) {
		if (path.length > 0) {
			this._initialExpression &&
			this._initialExpression.reassignPath(path, options);
		}
		this._reassignedPathTracker.reassignPath(path);
	}

	forEachAtPath (path: string[], callback: PathCallback) {
		this._initialExpression && callback(path, this._initialExpression);
	}

	someAtPath (path: string[], predicateFunction: PathPredicate) {
		return (
			this._reassignedPathTracker.someReassignedPath(path, predicateFunction) ||
			(this._initialExpression &&
				predicateFunction(path, this._initialExpression))
		);
	}
}
