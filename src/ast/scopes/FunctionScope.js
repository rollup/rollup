import ReturnValueScope from './ReturnValueScope';
import ParameterVariable from '../variables/ParameterVariable';
import ThisVariable from '../variables/ThisVariable';

export default class FunctionScope extends ReturnValueScope {
	constructor ( options = {} ) {
		super( options );
		this.variables.arguments = new ParameterVariable( 'arguments' );
		this.variables.this = new ThisVariable();
	}

	findLexicalBoundary () {
		return this;
	}
}
