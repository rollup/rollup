import FunctionNode from './shared/FunctionNode';
import Scope from '../scopes/Scope';
import { NodeType } from './NodeType';
import { Node } from './shared/Node';
import Import from './Import';

export function isFunctionDeclaration(node: Node): node is FunctionDeclaration {
	return node.type === NodeType.FunctionDeclaration;
}

export default class FunctionDeclaration extends FunctionNode {
	type: NodeType.FunctionDeclaration;

	initialiseChildren(parentScope: Scope, dynamicImportReturnList: Import[]) {
		if (this.id !== null) {
			this.id.initialiseAndDeclare(parentScope, dynamicImportReturnList, 'function', this);
			this.id.variable.isId = true;
		}
		for (const param of this.params) {
			param.initialiseAndDeclare(this.scope, dynamicImportReturnList, 'parameter', null);
		}
		this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }), dynamicImportReturnList);
	}
}
