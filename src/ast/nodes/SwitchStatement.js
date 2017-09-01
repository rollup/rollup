import Scope from '../scopes/Scope.js';
import Statement from './shared/Statement.js';

export default class SwitchStatement extends Statement {
	hasEffects ( options ) {
		return super.hasEffects( options.setIgnoreBreakStatements() );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );
	}
}
