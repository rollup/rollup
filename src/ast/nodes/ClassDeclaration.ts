import ClassNode from './shared/ClassNode';
import Scope from '../scopes/Scope';
import Identifier from './Identifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../Module';
import { Node } from './shared/Node';

export function isClassDeclaration (node: Node): node is ClassDeclaration {
	return node.type === NodeType.ClassDeclaration;
}

export default class ClassDeclaration extends ClassNode {
	type: NodeType.ClassDeclaration;
	id: Identifier;

	initialiseChildren (parentScope: Scope) {
		// Class declarations are like let declarations: Not hoisted, can be reassigned, cannot be redeclared
		this.id && this.id.initialiseAndDeclare(parentScope, 'class', this);
		super.initialiseChildren(parentScope);
	}

	render (code: MagicString, options: RenderOptions) {
		if (options.systemBindings && this.id.variable.exportName) {
			code.appendRight(this.end, ` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`);
		}
		super.render(code, options);
	}
}
