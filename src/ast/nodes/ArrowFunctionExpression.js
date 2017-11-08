import Node from '../Node';
import Scope from '../scopes/Scope';
import ReturnValueScope from '../scopes/ReturnValueScope';

export default class ArrowFunctionExpression extends Node {
	bindNode () {
		this.body.bindImplicitReturnExpressionToScope
			? this.body.bindImplicitReturnExpressionToScope()
			: this.scope.addReturnExpression( this.body );
	}

	forEachReturnExpressionWhenCalledAtPath ( path, callOptions, callback, options ) {
		path.length === 0
		&& this.scope.forEachReturnExpressionWhenCalled( callOptions, callback, options );
	}

	hasEffects () {
		return false;
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
		this.scope = new ReturnValueScope( { parent: parentScope } );
	}

	someReturnExpressionWhenCalledAtPath ( path, callOptions, predicateFunction, options ) {
		return path.length > 0
			|| this.scope.someReturnExpressionWhenCalled( callOptions, predicateFunction, options );
	}
}
