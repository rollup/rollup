import Statement from './shared/Statement.js';
import Scope from '../scopes/Scope.js';

export default class ForInStatement extends Statement {
	initialiseChildren () {
		this.left.initialise( this.scope );
		this.right.initialise( this.scope.parent );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope({
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		});
	}
}
