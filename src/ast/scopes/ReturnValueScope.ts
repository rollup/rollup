import ParameterScope from './ParameterScope';
import { UndefinedAssignment } from '../values';
import Expression from '../nodes/Expression';

export default class ReturnValueScope extends ParameterScope {
	constructor (options = {}) {
		super(options);
		this._returnExpressions = new Set();
	}

	addReturnExpression (expression: Expression | UndefinedAssignment) {
		this._returnExpressions.add(expression);
	}

	forEachReturnExpressionWhenCalled (callOptions, callback, options) {
		this._returnExpressions.forEach(callback(options));
	}

	someReturnExpressionWhenCalled (callOptions, predicateFunction, options) {
		return Array.from(this._returnExpressions).some(predicateFunction(options));
	}
}
