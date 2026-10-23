import type { InclusionContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { EntityPathTracker, ObjectPath } from '../../utils/PathTracker';
import type { IdentifierWithVariable } from '../Identifier';
import { deoptimizeInteraction, ExpressionEntity } from './Expression';

/**
 * Represents the return value of a function where all return statements return
 * the same variable that is the target of an assignment. As the assigned value
 * may replace the declaration initializer before the function returns, value
 * queries resolve to unknown, and call arguments are deoptimized directly
 * instead of being forwarded to the initializer alone.
 */
export class ReturnedIdentifier extends ExpressionEntity {
	constructor(private readonly returnedIdentifier: IdentifierWithVariable) {
		super();
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		// The initializer may never be the value that is returned
		deoptimizeInteraction(interaction);
		this.returnedIdentifier.deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	deoptimizePath(path: ObjectPath): void {
		this.returnedIdentifier.deoptimizePath(path);
	}

	includeCallArgumentsWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		context: InclusionContext
	): void {
		this.returnedIdentifier.includeCallArgumentsWhenCalledAtPath(path, interaction, context);
	}
}
