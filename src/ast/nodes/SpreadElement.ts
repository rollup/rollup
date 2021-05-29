import { HasEffectsContext } from '../ExecutionContext';
import { NodeEvent } from '../NodeEvents';
import { ObjectPath, PathTracker, UNKNOWN_PATH, UnknownKey } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { ExpressionEntity } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class SpreadElement extends NodeBase {
	argument!: ExpressionNode;
	type!: NodeType.tSpreadElement;
	protected deoptimized = false;

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		if (path.length > 0) {
			this.argument.deoptimizeThisOnEventAtPath(
				event,
				[UnknownKey, ...path],
				thisParameter,
				recursionTracker
			);
		}
	}

	hasEffects(context: HasEffectsContext): boolean {
		return (
			this.argument.hasEffects(context) ||
			this.argument.hasEffectsWhenAccessedAtPath(UNKNOWN_PATH, context)
		);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		// Only properties of properties of the argument could become subject to reassignment
		// This will also reassign the return values of iterators
		this.argument.deoptimizePath([UnknownKey, UnknownKey]);
		this.context.requestTreeshakingPass();
	}
}
