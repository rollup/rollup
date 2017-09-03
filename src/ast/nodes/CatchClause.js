import Node from '../Node.js';
import Scope from '../scopes/Scope.js';

export default class CatchClause extends Node {
	initialiseChildren () {
		this.param && this.param.initialiseAndDeclare( this.scope, 'parameter' );
		this.body.initialiseAndReplaceScope( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );
	}
}
