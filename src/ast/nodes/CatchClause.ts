import type ChildScope from '../scopes/ChildScope';
import ParameterScope from '../scopes/ParameterScope';
import { EMPTY_PATH } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import type * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { type GenericEsTreeNode, NodeBase, onlyIncludeSelf } from './shared/Node';
import type { DeclarationPatternNode } from './shared/Pattern';

export default class CatchClause extends NodeBase {
	declare body: BlockStatement;
	declare param: DeclarationPatternNode | null;
	declare preventChildBlockScope: true;
	declare scope: ParameterScope;
	declare type: NodeType.tCatchClause;

	createScope(parentScope: ChildScope): void {
		this.scope = new ParameterScope(parentScope, true);
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		const { body, param, type } = esTreeNode;
		this.type = type as NodeType.tCatchClause;
		if (param) {
			this.param = new (this.scope.context.getNodeConstructor(param.type))(
				this,
				this.scope
			).parseNode(param) as unknown as DeclarationPatternNode;
			this.param!.declare('parameter', EMPTY_PATH, UNKNOWN_EXPRESSION);
		}
		this.body = new BlockStatement(this, this.scope.bodyScope).parseNode(body);
		return super.parseNode(esTreeNode);
	}
}

CatchClause.prototype.preventChildBlockScope = true;
CatchClause.prototype.includeNode = onlyIncludeSelf;
