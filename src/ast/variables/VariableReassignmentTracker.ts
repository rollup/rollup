import {
	ObjectPath,
	ObjectPathKey,
	PathCallback,
	PathPredicate,
	UNKNOWN_EXPRESSION,
	UNKNOWN_KEY
} from '../values';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionEntity } from '../nodes/shared/Expression';

class ReassignedPathTracker {
	private reassigned: boolean = false;
	private unknownReassignedSubPath: boolean = false;
	private subPaths: Map<ObjectPathKey, ReassignedPathTracker> = new Map();

	isReassigned(path: ObjectPath): boolean {
		if (path.length === 0) {
			return this.reassigned;
		}
		const [subPath, ...remainingPath] = path;
		return (
			this.unknownReassignedSubPath ||
			(this.subPaths.has(subPath) && this.subPaths.get(subPath).isReassigned(remainingPath))
		);
	}

	reassignPath(path: ObjectPath) {
		if (this.reassigned) return;
		if (path.length === 0) {
			this.reassigned = true;
		} else {
			this.reassignSubPath(path);
		}
	}

	reassignSubPath(path: ObjectPath) {
		if (this.unknownReassignedSubPath) return;
		const [subPath, ...remainingPath] = path;
		if (subPath === UNKNOWN_KEY) {
			this.unknownReassignedSubPath = true;
		} else {
			if (!this.subPaths.has(<string>subPath)) {
				this.subPaths.set(<string>subPath, new ReassignedPathTracker());
			}
			this.subPaths.get(<string>subPath).reassignPath(remainingPath);
		}
	}

	someReassignedPath(path: ObjectPath, callback: PathPredicate): boolean {
		return this.reassigned
			? callback(path, UNKNOWN_EXPRESSION)
			: path.length >= 1 && this.onSubPathIfReassigned(path, callback);
	}

	onSubPathIfReassigned(path: ObjectPath, callback: PathPredicate): boolean {
		const [subPath, ...remainingPath] = path;
		return this.unknownReassignedSubPath || subPath === UNKNOWN_KEY
			? callback(remainingPath, UNKNOWN_EXPRESSION)
			: this.subPaths.has(<string>subPath) &&
					this.subPaths.get(<string>subPath).someReassignedPath(remainingPath, callback);
	}
}

export default class VariableReassignmentTracker {
	private initialExpression: ExpressionEntity;
	private reassignedPathTracker: ReassignedPathTracker = new ReassignedPathTracker();

	constructor(initialExpression: ExpressionEntity) {
		this.initialExpression = initialExpression;
	}

	reassignPath(path: ObjectPath, options: ExecutionPathOptions) {
		if (path.length > 0) {
			this.initialExpression && this.initialExpression.reassignPath(path, options);
		}
		this.reassignedPathTracker.reassignPath(path);
	}

	forEachAtPath(path: ObjectPath, callback: PathCallback) {
		this.initialExpression && callback(path, this.initialExpression);
	}

	someAtPath(path: ObjectPath, predicateFunction: PathPredicate) {
		return (
			this.reassignedPathTracker.someReassignedPath(path, predicateFunction) ||
			(this.initialExpression && predicateFunction(path, this.initialExpression))
		);
	}
}
