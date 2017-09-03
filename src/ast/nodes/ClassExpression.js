import Class from './shared/Class.js';

export default class ClassExpression extends Class {
	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( this.scope, 'class', this );
		super.initialiseChildren( parentScope );
	}
}
