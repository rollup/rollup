import Function from './shared/Function.js';
import Scope from '../scopes/Scope.js';

export default class ArrowFunctionExpression extends Function {
	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: false,
			isLexicalBoundary: false
		} );
	}
}
