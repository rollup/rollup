import Statement from './shared/Statement.js';
import Scope from '../scopes/Scope.js';

export default class ForStatement extends Statement {
	initialiseChildren () {
		if ( this.init ) this.init.initialise( this.scope );
		if ( this.test ) this.test.initialise( this.scope );
		if ( this.update ) this.update.initialise( this.scope );

		if ( this.body.type === 'BlockStatement' ) {
			this.body.initialiseScope( this.scope );
			this.body.initialiseChildren();
		} else {
			this.body.initialise( this.scope );
		}
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );
	}
}
