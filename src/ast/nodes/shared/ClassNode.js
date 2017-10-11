import Node from '../../Node.js';
import Scope from '../../scopes/Scope';

export default class ClassNode extends Node {
	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath ( path, options, callOptions ) {
		return this.body.hasEffectsWhenCalledAtPath( path, options, callOptions )
			|| ( this.superClass && this.superClass.hasEffectsWhenCalledAtPath( path, options, callOptions ) );
	}

	initialiseChildren () {
		if ( this.superClass ) {
			this.superClass.initialise( this.scope );
		}
		this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( { parent: parentScope } );
	}
}
