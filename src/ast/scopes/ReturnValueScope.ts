import ParameterScope from './ParameterScope';
import CallOptions from '../CallOptions';
import { ExecutionPathOptions, NEW_EXECUTION_PATH } from '../ExecutionPathOptions';
import {
	ExpressionEntity,
	ForEachReturnExpressionCallback,
	SomeReturnExpressionCallback
} from '../nodes/shared/Expression';
import { UNKNOWN_EXPRESSION, UNKNOWN_PATH } from '../values';

export default class ReturnValueScope extends ParameterScope {
	private returnExpressions: ExpressionEntity[] = [];
	private returnExpression: ExpressionEntity | null = null;
	private bound: boolean = false;

	addReturnExpression(expression: ExpressionEntity) {
		this.returnExpressions.push(expression);
	}

	bind() {
		this.bound = true;
		if (this.returnExpressions.length === 1) {
			this.returnExpression = this.returnExpressions[0];
		} else {
			this.returnExpression = UNKNOWN_EXPRESSION;
			for (const expression of this.returnExpressions) {
				expression.reassignPath(UNKNOWN_PATH, NEW_EXECUTION_PATH);
			}
		}
	}

	forEachReturnExpressionWhenCalled(
		_callOptions: CallOptions,
		callback: ForEachReturnExpressionCallback,
		options: ExecutionPathOptions
	) {
		if (!this.bound) this.bind();
		callback(options, this.returnExpression);
	}

	someReturnExpressionWhenCalled(
		_callOptions: CallOptions,
		predicateFunction: SomeReturnExpressionCallback,
		options: ExecutionPathOptions
	): boolean {
		if (!this.bound) this.bind();
		return predicateFunction(options, this.returnExpression);
	}
}
