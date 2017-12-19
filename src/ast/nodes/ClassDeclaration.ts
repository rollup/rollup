import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';
import Identifier from './Identifier';

export default class ClassDeclaration extends ClassNode {
	type: 'ClassDeclaration';
	id: Identifier;

	initialiseChildren (parentScope: Scope) {
		// Class declarations are like let declarations: Not hoisted, can be reassigned, cannot be redeclared
		this.id && this.id.initialiseAndDeclare(parentScope, 'class', this);
		super.initialiseChildren(parentScope);
	}

	render (code, es) {
		if (!this.module.bundle.treeshake || this.included) {
			super.render(code, es);
		} else {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		}
	}
}
