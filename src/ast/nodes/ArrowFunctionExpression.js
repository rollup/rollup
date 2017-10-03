import Node from '../Node';
import Scope from '../scopes/Scope.js';

export default class ArrowFunctionExpression extends Node {
	// Should receive an implementation once we start tracking parameter values
	bindCallAtPath () {}

	hasEffects () {
		return this.included;
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		if ( path.length === 0 ) {
			return true;
		}
		return this.hasEffectsWhenMutatedAtPath( path.slice( 1 ) );
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.params.some( param => param.hasEffects( options ) )
			|| this.body.hasEffects( options );
	}

	hasEffectsWhenMutatedAtPath ( path ) {
		return this.included || path.length > 0;
	}

	initialiseChildren () {
		this.params.forEach( param => param.initialiseAndDeclare( this.scope, 'parameter' ) );
		if ( this.body.initialiseAndReplaceScope ) {
			this.body.initialiseAndReplaceScope( new Scope( { parent: this.scope } ) );
		} else {
			this.body.initialise( this.scope );
		}
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( { parent: parentScope } );
	}
}
