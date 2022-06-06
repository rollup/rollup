import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext } from '../../ExecutionContext';
import {
	INTERACTION_ASSIGNED,
	INTERACTION_CALLED,
	NodeInteraction,
	NodeInteractionCalled,
	NodeInteractionWithThisArg
} from '../../NodeInteractions';
import { type ObjectPath, type PathTracker, UNKNOWN_PATH } from '../../utils/PathTracker';
import {
	type ExpressionEntity,
	type LiteralValueOrUnknown,
	UNKNOWN_EXPRESSION,
	UnknownValue
} from './Expression';
import { NodeBase } from './Node';

export default abstract class CallExpressionBase extends NodeBase implements DeoptimizableEntity {
	protected declare interaction: NodeInteractionCalled;
	protected returnExpression: ExpressionEntity | null = null;
	private readonly deoptimizableDependentExpressions: DeoptimizableEntity[] = [];
	private readonly expressionsToBeDeoptimized = new Set<ExpressionEntity>();

	deoptimizeCache(): void {
		if (this.returnExpression !== UNKNOWN_EXPRESSION) {
			this.returnExpression = UNKNOWN_EXPRESSION;
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
		const returnExpression = this.getReturnExpression();
		if (returnExpression !== UNKNOWN_EXPRESSION) {
			returnExpression.deoptimizePath(path);
		}
	}

	deoptimizeThisOnInteractionAtPath(
		interaction: NodeInteractionWithThisArg,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (returnExpression === UNKNOWN_EXPRESSION) {
			interaction.thisArg.deoptimizePath(UNKNOWN_PATH);
		} else {
			recursionTracker.withTrackedEntityAtPath(
				path,
				returnExpression,
				() => {
					this.expressionsToBeDeoptimized.add(interaction.thisArg);
					returnExpression.deoptimizeThisOnInteractionAtPath(interaction, path, recursionTracker);
				},
				undefined
			);
		}
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		const returnExpression = this.getReturnExpression(recursionTracker);
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
	): ExpressionEntity {
		const returnExpression = this.getReturnExpression(recursionTracker);
		if (this.returnExpression === UNKNOWN_EXPRESSION) {
			return UNKNOWN_EXPRESSION;
		}
		return recursionTracker.withTrackedEntityAtPath(
			path,
			returnExpression,
			() => {
				this.deoptimizableDependentExpressions.push(origin);
				return returnExpression.getReturnExpressionWhenCalledAtPath(
					path,
					interaction,
					recursionTracker,
					origin
				);
			},
			UNKNOWN_EXPRESSION
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const { type } = interaction;
		if (type === INTERACTION_CALLED) {
			if (
				(interaction.withNew
					? context.instantiated
					: context.called
				).trackEntityAtPathAndGetIfTracked(path, interaction.args, this)
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
		return this.getReturnExpression().hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	protected abstract getReturnExpression(recursionTracker?: PathTracker): ExpressionEntity;
}
