import FunctionNode from './shared/FunctionNode';
import { NodeType } from './NodeType';
import { GenericEsTreeNode, Node, NodeBase } from './shared/Node';
import Identifier from './Identifier';

export function isFunctionDeclaration(node: Node): node is FunctionDeclaration {
	return node.type === NodeType.FunctionDeclaration;
}

export default class FunctionDeclaration extends FunctionNode {
	type: NodeType.FunctionDeclaration;

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
				this.module,
				this.scope.parent,
				false
			);
		}
		super.parseNode(esTreeNode, nodeConstructors);
	}
}
