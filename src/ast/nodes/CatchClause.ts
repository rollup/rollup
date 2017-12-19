import Node from '../Node';
import CatchScope from '../scopes/CatchScope';

export default class CatchClause extends Node {
	initialiseChildren () {
		this.param && this.param.initialiseAndDeclare( this.scope, 'parameter' );
		this.body.initialiseAndReplaceScope( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new CatchScope( { parent: parentScope } );
	}
}
