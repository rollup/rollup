import type { HasEffectsContext } from './ExecutionContext';
import type { NodeInteractionAssigned } from './NodeInteractions';
import type { ObjectPath } from './utils/PathTracker';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Entity {}

export interface WritableEntity extends Entity {
	/**
	 * Reassign a given path of an object.
	 * E.g., node.deoptimizePath(['x', 'y']) is called when something
	 * is assigned to node.x.y. If the path is [UnknownKey], then the return
	 * expression of this node is reassigned as well.
	 */
	deoptimizePath(path: ObjectPath): void;

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteractionAssigned,
		context: HasEffectsContext
	): boolean;
}
