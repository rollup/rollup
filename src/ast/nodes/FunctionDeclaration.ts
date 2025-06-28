import type { ast } from '../../rollup/types';
import type ChildScope from '../scopes/ChildScope';
import Identifier, { type IdentifierWithVariable } from './Identifier';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';

export default class FunctionDeclaration extends FunctionNode<ast.FunctionDeclaration> {
	declare parent: nodes.FunctionDeclarationParent;
	declare type: NodeType.tFunctionDeclaration;

	initialise(): void {
		super.initialise();
		if (this.id !== null) {
			this.id.variable.isId = true;
		}
	}

	protected onlyFunctionCallUsed(): boolean {
		// call super.onlyFunctionCallUsed for export default anonymous function
		return this.id?.variable.getOnlyFunctionCallUsed() ?? super.onlyFunctionCallUsed();
	}

	parseNode(esTreeNode: ast.FunctionDeclaration): this {
		if (esTreeNode.id !== null) {
			this.id = new Identifier(this, this.scope.parent as ChildScope).parseNode(
				esTreeNode.id
			) as IdentifierWithVariable;
		}
		return super.parseNode(esTreeNode);
	}
}
