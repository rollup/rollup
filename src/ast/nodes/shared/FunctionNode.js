import Node from '../../Node.js';
import FunctionScope from '../../scopes/FunctionScope';
import VirtualObjectExpression from './VirtualObjectExpression';

export default class FunctionNode extends Node {
	bindNode () {
		this.body.bindImplicitReturnExpressionToScope();
	}

	forEachReturnExpressionWhenCalledAtPath ( path, callOptions, callback, options ) {
		path.length === 0
		&& this.scope.forEachReturnExpressionWhenCalled( callOptions, callback, options );
	}

	hasEffects ( options ) {
		return this.id && this.id.hasEffects( options );
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
		const innerOptions = this.scope.getOptionsWhenCalledWith( callOptions, options );
		return this.params.some( param => param.hasEffects( innerOptions ) )
			|| this.body.hasEffects( innerOptions );
	}

	includeInBundle () {
		this.scope.variables.arguments.includeVariable();
		return super.includeInBundle();
	}

	initialiseNode () {
		this.prototypeObject = new VirtualObjectExpression();
	}

	initialiseScope ( parentScope ) {
		this.scope = new FunctionScope( { parent: parentScope } );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		return path.length > 0
			|| this.scope.someReturnExpressionWhenCalled( callOptions, predicateFunction, options );
	}
}
