import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';
import Identifier from './Identifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';

export default class ClassDeclaration extends ClassNode {
	type: NodeType.ClassDeclaration;
	id: Identifier;

	initialiseChildren (parentScope: Scope) {
		// Class declarations are like let declarations: Not hoisted, can be reassigned, cannot be redeclared
		this.id && this.id.initialiseAndDeclare(parentScope, 'class', this);
		super.initialiseChildren(parentScope);
	}

	render (code: MagicString, options: RenderOptions) {
		if (!this.module.graph.treeshake || this.included) {
			if (options.systemBindings && this.id.variable.exportName) {
				code.appendRight(this.end, ` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`);
			}
			super.render(code, options);
		} else {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		}
	}
}
