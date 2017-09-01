import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ArrayPattern extends Node {
	assignExpression () {
		this.eachChild( child => child.assignExpression( UNKNOWN_ASSIGNMENT ) );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.someChild( child => child.hasEffectsWhenAssigned( options ) );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.eachChild( child => child.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT ) );
	}
}
