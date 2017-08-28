import Scope from '../scopes/Scope.js';
import Statement from './shared/Statement.js';

export default class SwitchStatement extends Statement {
	hasEffects(options) {
		return super.hasEffects(Object.assign({}, options, {inNestedBreakableStatement: true}));
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true,
			isLexicalBoundary: false
		} );
	}
}
