import ParameterScope from './ParameterScope';

export default class ReturnValueScope extends ParameterScope {
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
