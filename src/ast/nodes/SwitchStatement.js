import Scope from '../scopes/Scope.js';
import Statement from './shared/Statement.js';

export default class SwitchStatement extends Statement {
	initialise ( scope ) {
		this.scope = new Scope( {
			parent: scope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );

		super.initialise( this.scope );
	}
}
