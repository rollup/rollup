import Identifier from './Identifier';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { GenericEsTreeNode, Node } from './shared/Node';

export function isFunctionDeclaration(node: Node): node is FunctionDeclaration {
	return node.type === NodeType.FunctionDeclaration;
}

export default class FunctionDeclaration extends FunctionNode {
	type: NodeType.tFunctionDeclaration;

	initialise() {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		if (esTreeNode.id !== null) {
			this.id = <Identifier>new this.context.nodeConstructors.Identifier(
				esTreeNode.id,
				this,
				this.scope.parent
			);
		}
		super.parseNode(esTreeNode);
	}
}
