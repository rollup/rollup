import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../../NodeInteractions';
import { INTERACTION_ASSIGNED, INTERACTION_CALLED } from '../../NodeInteractions';
import { type ObjectPath, type PathTracker, UNKNOWN_PATH } from '../../utils/PathTracker';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UNKNOWN_RETURN_EXPRESSION,
	UnknownValue
} from './Expression';
import { NodeBase } from './Node';

export default abstract class CallExpressionBase extends NodeBase implements DeoptimizableEntity {
	protected declare interaction: NodeInteractionCalled;
	protected returnExpression: [expression: ExpressionEntity, isPure: boolean] | null = null;
	private readonly deoptimizableDependentExpressions: DeoptimizableEntity[] = [];
	private readonly expressionsToBeDeoptimized = new Set<ExpressionEntity>();

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		const { args, thisArg } = interaction;
		const [returnExpression, isPure] = this.getReturnExpression(recursionTracker);
		if (isPure) return;
		if (returnExpression === UNKNOWN_EXPRESSION) {
			thisArg?.deoptimizePath(UNKNOWN_PATH);
			if (args) {
				for (const argument of args) {
					argument.deoptimizePath(UNKNOWN_PATH);
				}
			}
		} else {
			recursionTracker.withTrackedEntityAtPath(
				path,
				returnExpression,
				() => {
					if (thisArg) {
						this.expressionsToBeDeoptimized.add(thisArg);
					}
					if (args) {
						for (const argument of args) {
							this.expressionsToBeDeoptimized.add(argument);
						}
					}
					returnExpression.deoptimizeArgumentsOnInteractionAtPath(
						interaction,
						path,
						recursionTracker
					);
				},
				null
			);
		}
	}

	deoptimizeCache(): void {
		if (this.returnExpression?.[0] !== UNKNOWN_EXPRESSION) {
			this.returnExpression = UNKNOWN_RETURN_EXPRESSION;
			for (const expression of this.deoptimizableDependentExpressions) {
				expression.deoptimizeCache();
			}
			for (const expression of this.expressionsToBeDeoptimized) {
				expression.deoptimizePath(UNKNOWN_PATH);
			}
		}
	}

	deoptimizePath(path: ObjectPath): void {
		if (
			path.length === 0 ||
			this.context.deoptimizationTracker.trackEntityAtPathAndGetIfTracked(path, this)
		) {
			return;
		}
		const [returnExpression] = this.getReturnExpression();
		if (returnExpression !== UNKNOWN_EXPRESSION) {
			returnExpression.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const [returnExpression] = this.getReturnExpression(recursionTracker);
		if (returnExpression === UNKNOWN_EXPRESSION) {
			return UnknownValue;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			returnExpression,
			() => {
				this.deoptimizableDependentExpressions.push(origin);
				return returnExpression.getLiteralValueAtPath(path, recursionTracker, origin);
			},
			UnknownValue
		);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (returnExpression[0] === UNKNOWN_EXPRESSION) {
			return returnExpression;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			returnExpression,
			() => {
				this.deoptimizableDependentExpressions.push(origin);
				const [expression, isPure] = returnExpression[0].getReturnExpressionWhenCalledAtPath(
					path,
					interaction,
					recursionTracker,
					origin
				);
				return [expression, isPure || returnExpression[1]];
			},
			UNKNOWN_RETURN_EXPRESSION
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const { type } = interaction;
		if (type === INTERACTION_CALLED) {
			const { args, withNew } = interaction;
			if (
				(withNew ? context.instantiated : context.called).trackEntityAtPathAndGetIfTracked(
					path,
					args,
					this
				)
			) {
				return false;
			}
		} else if (
			(type === INTERACTION_ASSIGNED
				? context.assigned
				: context.accessed
			).trackEntityAtPathAndGetIfTracked(path, this)
		) {
			return false;
		}
		const [returnExpression, isPure] = this.getReturnExpression();
		return (
			(type === INTERACTION_ASSIGNED || !isPure) &&
			returnExpression.hasEffectsOnInteractionAtPath(path, interaction, context)
		);
	}

	protected abstract getReturnExpression(
		recursionTracker?: PathTracker
	): [expression: ExpressionEntity, isPure: boolean];
}
