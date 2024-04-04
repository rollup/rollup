import type ChildScope from '../scopes/ChildScope';
import type ExportDefaultDeclaration from './ExportDefaultDeclaration';
import Identifier, { type IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';
import type { GenericEsTreeNode } from './shared/Node';

export default class FunctionDeclaration extends FunctionNode {
	declare type: NodeType.tFunctionDeclaration;

	initialise(): void {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	onlyFunctionCallUsed(): boolean {
		let isOnlyFunctionCallUsed = true;
		if (this.parent.type === NodeType.ExportDefaultDeclaration) {
			isOnlyFunctionCallUsed &&= (
				this.parent as ExportDefaultDeclaration
			).variable.getOnlyFunctionCallUsed();
		}
		// if no id, it cannot be accessed from the same module
		isOnlyFunctionCallUsed &&= this.id?.variable.getOnlyFunctionCallUsed() ?? true;
		return isOnlyFunctionCallUsed;
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		if (esTreeNode.id !== null) {
			this.id = new Identifier(this, this.scope.parent as ChildScope).parseNode(
				esTreeNode.id
			) as IdentifierWithVariable;
		}
		return super.parseNode(esTreeNode);
	}
}
