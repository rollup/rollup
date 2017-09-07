import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import FunctionScope from '../scopes/FunctionScope';
import { UNKNOWN_ASSIGNMENT, UNKNOWN_OBJECT_LITERAL } from '../values';

export default class FunctionExpression extends Node {
	bindCall ( { withNew } ) {
		const thisVariable = this.scope.findVariable( 'this' );

		if ( withNew ) {
			thisVariable.assignExpression( UNKNOWN_OBJECT_LITERAL );
		} else {
			thisVariable.assignExpression( UNKNOWN_ASSIGNMENT );
		}
	}

	hasEffects ( options ) {
		return this.included || (this.id && this.id.hasEffects( options ));
	}

	hasEffectsWhenCalled ( options ) {
		const innerOptions = options.setIgnoreSafeThis();
		return this.params.some( param => param.hasEffects( innerOptions ) )
			|| this.body.hasEffects( innerOptions );
	}

	hasEffectsWhenMutated () {
		return this.included;
	}

	initialiseChildren () {
		this.id && this.id.initialiseAndDeclare( this.scope, 'function', this );
		this.params.forEach( param => param.initialiseAndDeclare( this.scope, 'parameter' ) );
		this.body.initialiseAndReplaceScope( new Scope( { parent: this.scope } ) );
	}

	initialiseScope ( parentScope ) {
		this.scope = new FunctionScope( { parent: parentScope } );
	}
}
