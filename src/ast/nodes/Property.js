import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Property extends Node {
	bindAssignmentAtPath ( path, expression ) {
		this.value.bindAssignmentAtPath( path, expression );
	}

	bindCallAtPath ( path, callOptions ) {
		this.value.bindCallAtPath( path, callOptions );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return this.value.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		return this.value.hasEffectsWhenCalledAtPath( path, options );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		return this.value.hasEffectsWhenMutatedAtPath( path, options );
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
