import { HasEffectsContext } from './ExecutionContext';
import { ObjectPath } from './utils/PathTracker';

export interface Entity {}

export interface WritableEntity extends Entity {
	/**
	 * Reassign a given path of an object.
	 * E.g., node.deoptimizePath(['x', 'y']) is called when something
	 * is assigned to node.x.y. If the path is [UnknownKey], then the return
	 * expression of this node is reassigned as well.
	 */
	deoptimizePath(path: ObjectPath): void;
	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean;
}
