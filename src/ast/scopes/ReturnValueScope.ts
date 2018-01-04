import ParameterScope from './ParameterScope';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';
import { Expression, ForEachReturnExpressionCallback } from '../nodes/shared/Expression';

export default class ReturnValueScope extends ParameterScope {
	_returnExpressions: Set<Expression>;

	constructor (options = {}) {
		super(options);
		this._returnExpressions = new Set();
	}

	addReturnExpression (expression: Expression) {
		this._returnExpressions.add(expression);
	}

	forEachReturnExpressionWhenCalled (_callOptions: CallOptions, callback: ForEachReturnExpressionCallback, options: ExecutionPathOptions) {
		this._returnExpressions.forEach(callback(options));
	}

	someReturnExpressionWhenCalled (
		_callOptions: CallOptions, predicateFunction: (options: ExecutionPathOptions) => (node: Expression) => boolean,
		options: ExecutionPathOptions
	): boolean {
		return Array.from(this._returnExpressions).some(predicateFunction(options));
	}
}
