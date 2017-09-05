import Node from '../Node.js';
import Scope from '../scopes/Scope.js';

export default class FunctionExpression extends Node {
	hasEffects () {
		return this.included || (this.id && this.id.hasEffects());
	}

	initialiseChildren () {
		this.id && this.id.initialiseAndDeclare( this.scope, 'function', this );
		this.params.forEach( param => param.initialiseAndDeclare( this.scope, 'parameter' ) );
		this.body.initialiseAndReplaceScope( new Scope( {
			parent: this.scope,
			isBlockScope: false,
			isLexicalBoundary: true
		} ) );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: false,
			isLexicalBoundary: true
		} );
	}
}
