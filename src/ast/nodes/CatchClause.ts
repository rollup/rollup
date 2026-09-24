import type ChildScope from '../scopes/ChildScope';
import ParameterScope from '../scopes/ParameterScope';
import type BlockStatement from './BlockStatement';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class CatchClause extends NodeBase {
	declare parent: nodes.CatchClauseParent;
	declare body: BlockStatement;
	declare param: nodes.BindingPattern | null;
	declare preventChildBlockScope: true;
	declare scope: ParameterScope;
	declare type: NodeType.tCatchClause;

	createScope(parentScope: ChildScope): void {
		this.scope = new ParameterScope(parentScope, true);
	}
}

CatchClause.prototype.preventChildBlockScope = true;
CatchClause.prototype.includeNode = onlyIncludeSelf;
