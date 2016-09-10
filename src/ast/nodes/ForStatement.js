import Statement from './shared/Statement.js';
import Scope from '../scopes/Scope.js';

export default class ForStatement extends Statement {
	initialise ( scope ) {
		if ( this.body.type === 'BlockStatement' ) {
			this.body.createScope( scope );
			this.scope = this.body.scope;
		} else {
			this.scope = new Scope({
				parent: scope,
				isBlockScope: true,
				isLexicalBoundary: false
			});
		}

		// can't use super, because we need to control the order
		if ( this.init ) this.init.initialise( this.scope );
		if ( this.test ) this.test.initialise( this.scope );
		if ( this.update ) this.update.initialise( this.scope );
		this.body.initialise( this.scope );
	}
}
