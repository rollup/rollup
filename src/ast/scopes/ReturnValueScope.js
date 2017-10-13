import Scope from './Scope';

export default class ReturnValueScope extends Scope {
	constructor ( options = {} ) {
		super( options );
		this._returnExpressions = new Set();
	}

	addReturnExpression ( expression ) {
		this._returnExpressions.add( expression );
	}

	someReturnExpressionWhenCalled ( callOptions, predicateFunction ) {
		return Array.from( this._returnExpressions ).some( predicateFunction );
	}
}
