import FunctionNode from './shared/FunctionNode';
import Scope from '../scopes/Scope';
import { NodeType } from './NodeType';
import Import from './Import';

export default class FunctionExpression extends FunctionNode {
	type: NodeType.FunctionExpression;

	initialiseChildren(_parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.id && this.id.initialiseAndDeclare(this.scope, dynamicImportReturnList, 'function', this);
		for (const param of this.params) {
			param.initialiseAndDeclare(this.scope, dynamicImportReturnList, 'parameter', null);
		}
		this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }), dynamicImportReturnList);
	}
}
