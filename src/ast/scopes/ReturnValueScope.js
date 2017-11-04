import ParameterScope from './ParameterScope';

export default class ReturnValueScope extends ParameterScope {
	constructor ( options = {} ) {
		super( options );
		this._returnExpressions = new Set();
	}

	addReturnExpression ( expression ) {
		this._returnExpressions.add( expression );
	}

	forEachReturnExpressionWhenCalled ( callOptions, callback, options ) {
		const innerOptions = this.getOptionsWithReplacedParameters( callOptions.args, options );
		this._returnExpressions.forEach( callback( innerOptions ) );
	}

	someReturnExpressionWhenCalled ( callOptions, predicateFunction, options ) {
		const innerOptions = this.getOptionsWithReplacedParameters( callOptions.args, options );
		return Array.from( this._returnExpressions ).some( predicateFunction( innerOptions ) );
	}
}
