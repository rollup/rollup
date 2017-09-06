import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ArrayPattern extends Node {
	bindAssignment () {
		this.eachChild( child => child.bindAssignment( UNKNOWN_ASSIGNMENT ) );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.someChild( child => child.hasEffectsWhenAssigned( options ) );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.eachChild( child => child.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT ) );
	}
}
