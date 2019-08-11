import { ExecutionPathOptions } from './ExecutionPathOptions';
import { ObjectPath } from './values';

export interface Entity {
	toString: () => string;
}

export interface WritableEntity extends Entity {
	/**
	 * Reassign a given path of an object.
	 * E.g., node.deoptimizePath(['x', 'y']) is called when something
	 * is assigned to node.x.y. If the path is [UNKNOWN_KEY], then the return
	 * expression of this node is reassigned as well.
	 */
	deoptimizePath(path: ObjectPath): void;
	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean;
}
