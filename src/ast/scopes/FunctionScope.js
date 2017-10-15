import ReturnValueScope from './ReturnValueScope';
import ThisVariable from '../variables/ThisVariable';
import LocalVariable from '../variables/LocalVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class FunctionScope extends ReturnValueScope {
	constructor ( options = {} ) {
		super( options );
		this.variables.arguments = new LocalVariable( 'arguments', null, UNKNOWN_ASSIGNMENT );
		this.variables.this = new ThisVariable();
	}

	findLexicalBoundary () {
		return this;
	}
}
