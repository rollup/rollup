import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { ObjectPath, PathTracker } from '../../utils/PathTracker';
import { LiteralValueOrUnknown, UnknownValue } from '../../values';
import { ExpressionEntity } from './Expression';
import { IncludeChildren } from './Node';

export class MultiExpression implements ExpressionEntity {
	included = false;

	private expressions: ExpressionEntity[];

	constructor(expressions: ExpressionEntity[]) {
		this.expressions = expressions;
	}

	deoptimizePath(path: ObjectPath): void {
		for (const expression of this.expressions) {
			expression.deoptimizePath(path);
		}
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return new MultiExpression(
			this.expressions.map(expression =>
				expression.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
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

	includeCallArguments(): void {}
}
