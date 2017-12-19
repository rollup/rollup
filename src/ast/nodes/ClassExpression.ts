import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';

export default class ClassExpression extends ClassNode {
	type: 'ClassExpression';

	initialiseChildren (parentScope: Scope) {
		this.id && this.id.initialiseAndDeclare(this.scope, 'class', this);
		super.initialiseChildren(parentScope);
	}
}
