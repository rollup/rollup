import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class RestElement extends Node {
	bindAssignmentAtPath ( path, expression, options ) {
		path.length === 0
		&& this.argument.bindAssignmentAtPath( [], UNKNOWN_ASSIGNMENT, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return path.length > 0
			|| this.argument.hasEffectsWhenAssignedAtPath( [], options );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.argument.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT );
	}
}
