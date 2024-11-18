import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { ExpressionEntity, type LiteralValueOrUnknown } from './Expression';

export class ObjectMember extends ExpressionEntity {
	constructor(
		private readonly object: ExpressionEntity,
		private readonly key: string
	) {
		super();
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.object.deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			[this.key, ...path],
			recursionTracker
		);
	}

	deoptimizePath(path: ObjectPath): void {
		this.object.deoptimizePath([this.key, ...path]);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.object.getLiteralValueAtPath([this.key, ...path], recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		return this.object.getReturnExpressionWhenCalledAtPath(
			[this.key, ...path],
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return this.object.hasEffectsOnInteractionAtPath([this.key, ...path], interaction, context);
	}
}
