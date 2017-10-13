import Node from '../Node';
import Scope from '../scopes/Scope.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ArrowFunctionExpression extends Node {
	hasEffects () {
		return this.included;
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenAssignedAtPath ( path ) {
		return path.length > 1;
	}

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.params.some( param => param.hasEffects( options ) )
			|| this.body.hasEffects( options );
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

	someReturnExpressionAtPath ( path, callOptions, predicateFunction ) {
		if ( this.body.type !== 'BlockStatement' ) {
			return predicateFunction( path, this.body );
		}
		return predicateFunction( path, UNKNOWN_ASSIGNMENT );
	}
}
