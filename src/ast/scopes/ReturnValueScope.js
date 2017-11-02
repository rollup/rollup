import ParameterScope from './ParameterScope';

export default class ReturnValueScope extends ParameterScope {
	constructor ( options = {} ) {
		super( options );
		this._returnExpressions = new Set();
	}

	addReturnExpression ( expression ) {
		this._returnExpressions.add( expression );
	}

	forEachReturnExpressionWhenCalled ( callback ) {
		this._returnExpressions.forEach( exp => callback( exp ) );
	}

	someReturnExpressionWhenCalled ( callOptions, predicateFunction, options ) {
		const innerOptions = this.getOptionsWithReplacedParameters( callOptions.args, options );
		return Array.from( this._returnExpressions ).some( predicateFunction( innerOptions ) );
	}
}
