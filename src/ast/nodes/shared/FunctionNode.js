import Node from '../../Node.js';
import FunctionScope from '../../scopes/FunctionScope';
import VirtualObjectExpression from './VirtualObjectExpression';
import { UNKNOWN_ASSIGNMENT } from '../../values';

export default class FunctionNode extends Node {
	bindNode () {
		this.thisVariable = this.scope.findVariable( 'this' );
		this.body.bindImplicitReturnExpressionToScope();
	}

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

	hasEffectsWhenCalledAtPath ( path, callOptions, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		const innerOptions = options.replaceThisInit( this.thisVariable,
			callOptions.withNew ? new VirtualObjectExpression() : UNKNOWN_ASSIGNMENT );
		return this.params.some( param => param.hasEffects( innerOptions ) )
			|| this.body.hasEffects( innerOptions );
	}

	initialiseNode () {
		this.prototypeObject = new VirtualObjectExpression();
	}

	initialiseScope ( parentScope ) {
		this.scope = new FunctionScope( { parent: parentScope } );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction ) {
		return this.scope.someReturnExpressionWhenCalled( callOptions, predicateFunction );
	}
}
