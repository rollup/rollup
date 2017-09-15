import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Property extends Node {
	bindAssignmentAtPath () {
		this.value.bindAssignmentAtPath( [], UNKNOWN_ASSIGNMENT );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.value.hasEffectsWhenAssigned( options );
	}

	initialiseAndDeclare ( parentScope, kind ) {
		this.initialiseScope( parentScope );
		this.key.initialise( parentScope );
		this.value.initialiseAndDeclare( parentScope, kind, UNKNOWN_ASSIGNMENT );
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}
}
