import Node from '../Node.js';
import Scope from '../scopes/Scope.js';

export default class FunctionExpression extends Node {
	hasEffects ( options ) {
		return this.included || (this.id && this.id.hasEffects( options ));
	}

	hasEffectsWhenCalled ( options ) {
		return this.params.some( param => param.hasEffects( options ) )
			|| this.body.hasEffects( options );
	}

	initialiseChildren () {
		this.id && this.id.initialiseAndDeclare( this.scope, 'function', this );
		this.params.forEach( param => param.initialiseAndDeclare( this.scope, 'parameter' ) );
		this.body.initialiseAndReplaceScope( new Scope( {
			parent: this.scope,
			isLexicalBoundary: true
		} ) );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isLexicalBoundary: true
		} );
	}
}
