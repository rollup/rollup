import { NodeBase } from './shared/Node';
import CatchScope from '../scopes/CatchScope';
import BlockStatement from './BlockStatement';
import Scope from '../scopes/Scope';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';
import Import from './Import';

export default class CatchClause extends NodeBase {
	type: NodeType.CatchClause;
	param: PatternNode;
	body: BlockStatement;
	scope: CatchScope;

	initialiseChildren(_parentScope: Scope, dynamicImportReturnList: Import[]) {
		this.param &&
			this.param.initialiseAndDeclare(this.scope, dynamicImportReturnList, 'parameter', null);
		this.body.initialiseAndReplaceScope(this.scope, dynamicImportReturnList);
	}

	initialiseScope(parentScope: Scope) {
		this.scope = new CatchScope({ parent: parentScope });
	}
}
