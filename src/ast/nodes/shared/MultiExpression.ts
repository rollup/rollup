import CallOptions from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { ExecutionPathOptions } from '../../ExecutionPathOptions';
import { ImmutableEntityPathTracker } from '../../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_VALUE } from '../../values';
import { ExpressionEntity } from './Expression';

export class MultiExpression implements ExpressionEntity {
	included: boolean;

	private expressions: ExpressionEntity[];

	constructor(expressions: ExpressionEntity[]) {
		this.expressions = expressions;
	}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		return UNKNOWN_VALUE;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: ImmutableEntityPathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return new MultiExpression(
			this.expressions.map(expression =>
				expression.getReturnExpressionWhenCalledAtPath(path, recursionTracker, origin)
			)
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenAccessedAtPath(path, options)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, options: ExecutionPathOptions): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenAssignedAtPath(path, options)) return true;
		}
		return false;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		options: ExecutionPathOptions
	): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenCalledAtPath(path, callOptions, options)) return true;
		}
		return false;
	}

	include(): void {}

	deoptimizePath(path: ObjectPath): void {
		for (const expression of this.expressions) {
			expression.deoptimizePath(path);
		}
	}
}
