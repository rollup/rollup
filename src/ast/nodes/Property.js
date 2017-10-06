import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Property extends Node {
	bindAssignmentAtPath ( path, expression ) {
		this.value.bindAssignmentAtPath( path, expression );
	}

	hasEffects ( options ) {
		return this.included
			|| this.key.hasEffects( options )
			|| this.value.hasEffects( options );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		if ( this.kind === 'get' ) {
			return path.length > 0
				|| this.value.hasEffectsWhenCalledAtPath( [], options.getHasEffectsWhenCalledOptions( this.value ) );
		}
		return this.value.hasEffectsWhenAccessedAtPath( path, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( this.kind === 'set' ) {
			return path.length > 0
				|| this.value.hasEffectsWhenCalledAtPath( [], options.getHasEffectsWhenCalledOptions( this.value ) );
		}
		return this.value.hasEffectsWhenAssignedAtPath( path, options );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if (this.kind === 'get') {
			return true;
		}
		return this.value.hasEffectsWhenCalledAtPath( path, options );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		if (this.kind === 'get') {
			return true;
		}
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
