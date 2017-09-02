import Class from './shared/Class.js';

export default class ClassExpression extends Class {
	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( this.scope, 'let', this );
		super.initialiseChildren( parentScope );
	}
}
