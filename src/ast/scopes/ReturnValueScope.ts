import ParameterScope from './ParameterScope';
import { UndefinedAssignment } from '../values';
import Expression from '../nodes/Expression';
import CallOptions from '../CallOptions';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class ReturnValueScope extends ParameterScope {
	_returnExpressions: Set<Expression | UndefinedAssignment>;

	constructor (options = {}) {
		super(options);
		this._returnExpressions = new Set();
	}

	addReturnExpression (expression: Expression | UndefinedAssignment) {
		this._returnExpressions.add(expression);
	}

	forEachReturnExpressionWhenCalled (_callOptions: CallOptions, callback: (options: ExecutionPathOptions) => (node: Expression | UndefinedAssignment) => void, options: ExecutionPathOptions) {
		this._returnExpressions.forEach(callback(options));
	}

	someReturnExpressionWhenCalled (_callOptions: CallOptions, predicateFunction: (options: ExecutionPathOptions) => (node: Expression | UndefinedAssignment) => boolean, options: ExecutionPathOptions): boolean {
		return Array.from(this._returnExpressions).some(predicateFunction(options));
	}
}
