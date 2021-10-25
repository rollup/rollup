import ChildScope from '../scopes/ChildScope';
import Identifier, { IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import { GenericEsTreeNode } from './shared/Node';

export default class FunctionDeclaration extends FunctionNode {
	declare type: NodeType.tFunctionDeclaration;

	initialise(): void {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		if (esTreeNode.id !== null) {
			this.id = new Identifier(
				esTreeNode.id,
				this,
				this.scope.parent as ChildScope
			) as IdentifierWithVariable;
		}
		super.parseNode(esTreeNode);
	}
}
