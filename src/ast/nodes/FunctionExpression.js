import Function from './shared/Function.js';

export default class FunctionExpression extends Function {
	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( this.scope, 'var', this );
		super.initialiseChildren( parentScope );
	}
}
