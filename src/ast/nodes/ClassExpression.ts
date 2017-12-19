import ClassNode from './shared/ClassNode';

export default class ClassExpression extends ClassNode {
	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( this.scope, 'class', this );
		super.initialiseChildren( parentScope );
	}
}
