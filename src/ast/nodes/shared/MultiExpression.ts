import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { ExpressionEntity } from './Expression';
import type { IncludeChildren } from './Node';

export class MultiExpression extends ExpressionEntity {
	included = false;

	constructor(private expressions: readonly ExpressionEntity[]) {
		super();
	}

	deoptimizePath(path: ObjectPath): void {
		for (const expression of this.expressions) {
			expression.deoptimizePath(path);
		}
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return new MultiExpression(
			this.expressions.map(expression =>
				expression.getReturnExpressionWhenCalledAtPath(path, interaction, recursionTracker, origin)
			)
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsOnInteractionAtPath(path, interaction, context)) return true;
		}
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		// This is only relevant to include values that do not have an AST representation,
		// such as UnknownArrayExpression. Thus we only need to include them once.
		for (const expression of this.expressions) {
			if (!expression.included) {
				expression.include(context, includeChildrenRecursively);
			}
		}
	}
}
