import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';
import Identifier from './Identifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { Node } from './shared/Node';
import { RenderOptions } from '../../utils/renderHelpers';

export function isClassDeclaration(node: Node): node is ClassDeclaration {
	return node.type === NodeType.ClassDeclaration;
}

export default class ClassDeclaration extends ClassNode {
	type: NodeType.ClassDeclaration;
	id: Identifier;

	initialiseChildren(parentScope: Scope) {
		// Class declarations are like let declarations: Not hoisted, can be reassigned, cannot be redeclared
		if (this.id) {
			this.id.initialiseAndDeclare(parentScope, 'class', this);
			this.id.variable.isId = true;
		}
		super.initialiseChildren(parentScope);
	}

	render(code: MagicString, options: RenderOptions) {
		if (options.systemBindings && this.id && this.id.variable.exportName) {
			code.appendLeft(
				this.end,
				` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`
			);
		}
		if (this.id) {
			const name = this.id.variable.getName()
			if (name !== this.id.variable.name) {
				code.appendRight(this.start, `let ${this.id.variable.safeName} = `)
				code.prependLeft(this.end, ';');
			}
		}
		super.render(code, options);
	}
}
