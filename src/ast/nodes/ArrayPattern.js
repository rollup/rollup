import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ArrayPattern extends Node {
	bindAssignmentAtPath () {
		this.eachChild( child => child.bindAssignmentAtPath( [], UNKNOWN_ASSIGNMENT ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.someChild( child => child.hasEffectsWhenAssignedAtPath( [], options ) );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.eachChild( child => child.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT ) );
	}
}
