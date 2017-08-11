import Node from '../Node.js';
import Scope from '../scopes/Scope.js';
import extractNames from '../utils/extractNames.js';

export default class CatchClause extends Node {
	initialiseChildren () {
		if ( this.param ) {
			this.param.initialise( this.scope );
			extractNames( this.param ).forEach( name => this.scope.addDeclaration( name, null, false, true ) );
		}
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
