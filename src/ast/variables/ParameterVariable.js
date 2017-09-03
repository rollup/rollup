import LocalVariable from './LocalVariable';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ParameterVariable extends LocalVariable {
	constructor ( name, declarator ) {
		super( name, declarator, UNKNOWN_ASSIGNMENT );
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN_ASSIGNMENT );
	}

	getName () {
		return this.name;
	}
}
