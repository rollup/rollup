import CallOptions from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { ExecutionContext } from '../../ExecutionContext';
import { ImmutableEntityPathTracker } from '../../utils/ImmutableEntityPathTracker';
import { LiteralValueOrUnknown, ObjectPath, UNKNOWN_VALUE } from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity } from './Expression';
import { ExpressionNode } from './Node';

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

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: ExecutionContext): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenAccessedAtPath(path, context)) return true;
		}
		return false;
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: ExecutionContext): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenAssignedAtPath(path, context)) return true;
		}
		return false;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: ExecutionContext
	): boolean {
		for (const expression of this.expressions) {
			if (expression.hasEffectsWhenCalledAtPath(path, callOptions, context)) return true;
		}
		return false;
	}

	include(): void {}

	includeCallArguments(args: (ExpressionNode | SpreadElement)[]): void {
		for (const expression of this.expressions) {
			expression.includeCallArguments(args);
		}
	}
}
