import CallOptions from '../CallOptions';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from '../nodes/shared/Expression';
import { UNKNOWN_EXPRESSION, UNKNOWN_PATH } from '../values';
import ParameterScope from './ParameterScope';

export default class ReturnValueScope extends ParameterScope {
	private returnExpressions: ExpressionEntity[] = [];
	private returnExpression: ExpressionEntity | null = null;
	private bound: boolean = false;

	addReturnExpression(expression: ExpressionEntity) {
		this.returnExpressions.push(expression);
	}

	bind() {
		if (this.bound) return;
		this.bound = true;
		if (this.returnExpressions.length === 1) {
			this.returnExpression = this.returnExpressions[0];
		} else {
			this.returnExpression = UNKNOWN_EXPRESSION;
			for (const expression of this.returnExpressions) {
				expression.reassignPath(UNKNOWN_PATH);
			}
		}
	}

	forEachReturnExpressionWhenCalled(
		_callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback
	) {
		if (!this.bound) this.bind();
		callback(this.returnExpression);
	}

	someReturnExpressionWhenCalled(
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		return predicateFunction(options, this.returnExpression);
	}
}
