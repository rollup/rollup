import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import FunctionNode from './shared/FunctionNode';

export default class FunctionDeclaration extends FunctionNode {
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
}
