import ChildScope from '../scopes/ChildScope';
import { IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { GenericEsTreeNode } from './shared/Node';

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
			this.id = new this.context.nodeConstructors.Identifier(esTreeNode.id, this, this.scope
				.parent as ChildScope) as IdentifierWithVariable;
		}
		super.parseNode(esTreeNode);
	}
}
