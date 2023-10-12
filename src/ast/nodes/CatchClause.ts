import CatchScope from '../scopes/CatchScope';
import type ChildScope from '../scopes/ChildScope';
import type BlockStatement from './BlockStatement';
import type * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { type GenericEsTreeNode, NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';

export default class CatchClause extends NodeBase {
	declare body: BlockStatement;
	declare param: PatternNode | null;
	declare preventChildBlockScope: true;
	declare scope: CatchScope;
	declare type: NodeType.tCatchClause;

	createScope(parentScope: ChildScope): void {
		this.scope = new CatchScope(parentScope, this.scope.context);
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		// Parameters need to be declared first as the logic is that initializers
		// of hoisted body variables are associated with parameters of the same
		// name instead of the variable
		const { param } = esTreeNode;
		if (param) {
			(this.param as GenericEsTreeNode) = new (this.scope.context.getNodeConstructor(param.type))(
				param,
				this,
				this.scope
			);
			this.param!.declare('parameter', UNKNOWN_EXPRESSION);
		}
		super.parseNode(esTreeNode);
	}
}
