import Node from '../Node';
import Scope from '../scopes/Scope.js';

export default class ArrowFunctionExpression extends Node {
	hasEffects () {
		return this.included;
	}

	initialiseChildren () {
		this.params.forEach( param => param.initialiseAndDeclare( this.scope, 'parameter' ) );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: false,
			isLexicalBoundary: false
		} );
	}
}
