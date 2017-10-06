import Scope from './Scope';
import ParameterVariable from '../variables/ParameterVariable';

export default class FunctionScope extends Scope {
	constructor ( options = {} ) {
		super( options );
		this.variables.arguments = new ParameterVariable( 'arguments' );
	}

	findLexicalBoundary () {
		return this;
	}
}
