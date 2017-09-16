import Node from '../Node.js';
import BlockScope from '../scopes/BlockScope';

export default class CatchClause extends Node {
	initialiseChildren () {
		this.param && this.param.initialiseAndDeclare( this.scope, 'parameter' );
		this.body.initialiseAndReplaceScope( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new BlockScope( { parent: parentScope } );
	}
}
