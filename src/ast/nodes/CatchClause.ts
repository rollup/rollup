import type { ast } from '../../rollup/types';
import type ChildScope from '../scopes/ChildScope';
import ParameterScope from '../scopes/ParameterScope';
import { EMPTY_PATH } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import type * as nodes from './node-unions';
import type * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { NodeBase, onlyIncludeSelf } from './shared/Node';

export default class CatchClause extends NodeBase<ast.CatchClause> {
	parent!: nodes.CatchClauseParent;
	body!: BlockStatement;
	param!: nodes.BindingPattern | null;
	preventChildBlockScope!: true;
	scope!: ParameterScope;
	type!: NodeType.tCatchClause;

	createScope(parentScope: ChildScope): void {
		this.scope = new ParameterScope(parentScope, true);
	}

	parseNode(esTreeNode: ast.CatchClause): this {
		const { body, param, type } = esTreeNode;
		this.type = type;
		if (param) {
			this.param = new (this.scope.context.getNodeConstructor(param.type))(
				this,
				this.scope
			).parseNode(param as any);
			this.param!.declare('parameter', EMPTY_PATH, UNKNOWN_EXPRESSION);
		}
		this.body = new BlockStatement(this, this.scope.bodyScope).parseNode(body);
		return super.parseNode(esTreeNode);
	}
}

CatchClause.prototype.preventChildBlockScope = true;
CatchClause.prototype.includeNode = onlyIncludeSelf;
