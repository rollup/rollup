import Scope from './Scope';
import LocalVariable from '../variables/LocalVariable';
import ParameterVariable from '../variables/ParameterVariable';

export default class FunctionScope extends Scope {
	constructor ( options = {} ) {
		super( options );
		this.variables.arguments = new ParameterVariable( 'arguments' );
		this.variables.this = new LocalVariable( 'this', null, null );
	}

	findLexicalBoundary () {
		return this;
	}
}
