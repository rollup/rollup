import { CallOptions } from './CallOptions';
import { HasEffectsContext, InclusionContext } from './ExecutionContext';
import { LiteralValue } from './nodes/Literal';
import { ExpressionEntity } from './nodes/shared/Expression';
import { ExpressionNode } from './nodes/shared/Node';
import SpreadElement from './nodes/SpreadElement';
import { ObjectPath } from './utils/PathTracker';

export const UnknownValue = Symbol('Unknown Value');
export type LiteralValueOrUnknown = LiteralValue | typeof UnknownValue;

export class UnknownExpression implements ExpressionEntity {
	included = true;

	deoptimizePath() {}

	getLiteralValueAtPath(): LiteralValueOrUnknown {
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(_path: ObjectPath) {
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenAccessedAtPath(
		path: ObjectPath,
		_context: HasEffectsContext
	) {
		return path.length > 0
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath) {
		return path.length > 0
	}

	hasEffectsWhenCalledAtPath(
		_path: ObjectPath,
		_callOptions: CallOptions,
		_context: HasEffectsContext
	) {
		return true;
	}

	include() {}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]) {
		for (const arg of args) {
			arg.include(context, false);
		}
	}

	mayModifyThisWhenCalledAtPath() { return true; }
}

export const UNKNOWN_EXPRESSION: ExpressionEntity = new UnknownExpression();

export const UNDEFINED_EXPRESSION: ExpressionEntity = new class UndefinedExpression extends UnknownExpression {
	getLiteralValueAtPath() {
		return undefined;
	}
};
