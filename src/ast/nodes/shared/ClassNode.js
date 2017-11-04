import Node from '../../Node.js';
import Scope from '../../scopes/Scope';

export default class ClassNode extends Node {
	bindCallAtPath ( path, callOptions, options ) {
		this.body.bindCallAtPath( path, callOptions, options );
		this.superClass && this.superClass.bindCallAtPath( path, callOptions, options );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		return this.body.hasEffectsWhenCalledAtPath( path, callOptions, options )
			|| ( this.superClass && this.superClass.hasEffectsWhenCalledAtPath( path, callOptions, options ) );
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
