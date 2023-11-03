import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import type { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { ExpressionEntity } from './Expression';

export class MultiExpression extends ExpressionEntity {
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
	): [expression: ExpressionEntity, isPure: boolean] {
		return [
			new MultiExpression(
				this.expressions.map(
					expression =>
						expression.getReturnExpressionWhenCalledAtPath(
							path,
							interaction,
							recursionTracker,
							origin
						)[0]
				)
			),
			false
		];
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
}
