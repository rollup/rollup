import type { CallOptions } from '../../CallOptions';
import type { DeoptimizableEntity } from '../../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
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
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return new MultiExpression(
			this.expressions.map(expression =>
				expression.getReturnExpressionWhenCalledAtPath(path, callOptions, recursionTracker, origin)
			)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenAccessedAtPath(path, context)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenAssignedAtPath(path, context)) return true;
		}
		return false;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenCalledAtPath(path, callOptions, context)) return true;
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
