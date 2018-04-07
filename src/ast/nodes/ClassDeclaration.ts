import ClassNode from './shared/ClassNode';
import Identifier from './Identifier';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { GenericEsTreeNode, Node, NodeBase } from './shared/Node';
import { RenderOptions } from '../../utils/renderHelpers';
import Scope from '../scopes/Scope';

export function isClassDeclaration(node: Node): node is ClassDeclaration {
	return node.type === NodeType.ClassDeclaration;
}

export default class ClassDeclaration extends ClassNode {
	type: NodeType.ClassDeclaration;
	id: Identifier;

	initialise() {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode, nodeConstructors: { [p: string]: typeof NodeBase }) {
		if (esTreeNode.id !== null) {
			this.id = <Identifier>new nodeConstructors.Identifier(
				esTreeNode.id,
				nodeConstructors,
				this,
				<Scope>this.scope.parent,
				false
			);
		}
		super.parseNode(esTreeNode, nodeConstructors);
	}

	render(code: MagicString, options: RenderOptions) {
		if (options.systemBindings && this.id && this.id.variable.exportName) {
			code.appendLeft(
				this.end,
				` exports('${this.id.variable.exportName}', ${this.id.variable.getName()});`
			);
		}
		super.render(code, options);
	}
}
