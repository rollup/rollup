import { NodeBase } from './shared/Node';
import CatchScope from '../scopes/CatchScope';
import BlockStatement from './BlockStatement';
import Scope from '../scopes/Scope';
import { PatternNode } from './shared/Pattern';

export default class CatchClause extends NodeBase {
	type: 'CatchClause';
	param: PatternNode;
	body: BlockStatement;
	scope: CatchScope;

	initialiseChildren () {
		this.param && this.param.initialiseAndDeclare(this.scope, 'parameter', null);
		this.body.initialiseAndReplaceScope(this.scope);
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new CatchScope({ parent: parentScope });
	}
}
