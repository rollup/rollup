import Statement from './shared/Statement.js';
import assignTo from './shared/assignTo.js';
import Scope from '../scopes/Scope.js';
import { UNKNOWN } from '../values.js';

export default class ForOfStatement extends Statement {
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

		super.initialise( this.scope );
		assignTo( this.left, this.scope, UNKNOWN );
	}
}
