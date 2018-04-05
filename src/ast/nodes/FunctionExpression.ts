import FunctionNode from './shared/FunctionNode';
import Scope from '../scopes/Scope';
import { NodeType } from './NodeType';

export default class FunctionExpression extends FunctionNode {
	type: NodeType.FunctionExpression;

	initialiseChildren(_parentScope: Scope) {
		this.id && this.id.initialiseAndDeclare(this.scope, 'function', this);
		for (const param of this.params) {
			param.initialiseAndDeclare(this.scope, 'parameter', null);
		}
		this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
	}
}
