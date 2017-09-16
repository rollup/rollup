import ClassNode from './shared/ClassNode.js';

export default class ClassExpression extends ClassNode {
	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( this.scope, 'class', this );
		super.initialiseChildren( parentScope );
	}
}
