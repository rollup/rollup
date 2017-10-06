import Node from '../../Node.js';
import FunctionScope from '../../scopes/FunctionScope';
import VirtualObjectExpression from './VirtualObjectExpression';

export default class FunctionNode extends Node {
	hasEffects ( options ) {
		return this.included || (this.id && this.id.hasEffects( options ));
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		if ( path.length <= 1 ) {
			return false;
		}
		if ( path[ 0 ] === 'prototype' ) {
			return this.prototypeObject.hasEffectsWhenAccessedAtPath( path.slice( 1 ), options );
		}
		return true;
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length <= 1 ) {
			return false;
		}
		if ( path[ 0 ] === 'prototype' ) {
			return this.prototypeObject.hasEffectsWhenAssignedAtPath( path.slice( 1 ), options );
		}
		return true;
	}

	hasEffectsWhenCalledAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		const innerOptions = options.calledWithNew()
			? options.setHasSafeThis( true )
			: options.setHasSafeThis( false );
		return this.params.some( param => param.hasEffects( innerOptions ) )
			|| this.body.hasEffects( innerOptions );
	}

	hasEffectsWhenMutatedAtPath ( path, options ) {
		if ( path.length === 0 ) {
			return false;
		}
		if ( path[ 0 ] === 'prototype' ) {
			return this.prototypeObject.hasEffectsWhenMutatedAtPath( path.slice( 1 ), options );
		}
		return true;
	}

	initialiseNode () {
		this.prototypeObject = new VirtualObjectExpression();
	}

	initialiseScope ( parentScope ) {
		this.scope = new FunctionScope( { parent: parentScope } );
	}
}
