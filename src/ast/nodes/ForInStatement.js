import Statement from './shared/Statement.js';
import assignTo from './shared/assignTo.js';
import Scope from '../scopes/Scope.js';
import { STRING } from '../values.js';

export default class ForInStatement extends Statement {
	initialiseChildren () {
		this.left.initialise( this.scope );
		this.right.initialise( this.scope.parent );
		this.body.initialiseAndReplaceScope ?
			this.body.initialiseAndReplaceScope( this.scope ) :
			this.body.initialise( this.scope );
		assignTo( this.left, this.scope, STRING );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope({
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		});
	}
}
