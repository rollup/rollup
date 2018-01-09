import FunctionNode from './shared/FunctionNode';
import Scope from '../scopes/Scope';
import { NodeType } from './index';

export default class FunctionExpression extends FunctionNode {
	type: NodeType.FunctionExpression;

	initialiseChildren () {
		this.id && this.id.initialiseAndDeclare(this.scope, 'function', this);
		this.params.forEach(param =>
			param.initialiseAndDeclare(this.scope, 'parameter', null)
		);
		this.body.initialiseAndReplaceScope(new Scope({ parent: this.scope }));
	}
}
