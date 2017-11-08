import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ArrayPattern extends Node {
	bindAssignmentAtPath ( path, expression, options ) {
		path.length === 0
		&& this.eachChild( child => child.bindAssignmentAtPath( [], UNKNOWN_ASSIGNMENT, options ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return path.length > 0
			|| this.someChild( child => child.hasEffectsWhenAssignedAtPath( [], options ) );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.eachChild( child => child.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT ) );
	}
}
