import Statement from './shared/Statement.js';
import Scope from '../scopes/Scope.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class ForOfStatement extends Statement {
	bind () {
		super.bind();
		this.left.assignExpression( UNKNOWN_ASSIGNMENT );
	}

	initialiseChildren () {
		this.left.initialise( this.scope );
		this.right.initialise( this.scope.parent );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );
	}
}
