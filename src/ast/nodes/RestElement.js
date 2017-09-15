import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class RestElement extends Node {
	bindAssignmentAtPath () {
		this.argument.bindAssignmentAtPath( [], UNKNOWN_ASSIGNMENT );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.argument.hasEffectsWhenAssignedAtPath( path, options );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.argument.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT );
	}
}
