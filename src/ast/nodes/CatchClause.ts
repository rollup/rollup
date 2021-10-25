import CatchScope from '../scopes/CatchScope';
import Scope from '../scopes/Scope';
import BlockStatement from './BlockStatement';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { GenericEsTreeNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class CatchClause extends NodeBase {
	declare body: BlockStatement;
	declare param: PatternNode | null;
	declare preventChildBlockScope: true;
	declare scope: CatchScope;
	declare type: NodeType.tCatchClause;

	createScope(parentScope: Scope): void {
		this.scope = new CatchScope(parentScope, this.context);
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		// Parameters need to be declared first as the logic is that initializers
		// of hoisted body variables are associated with parameters of the same
		// name instead of the variable
		const { param } = esTreeNode;
		if (param) {
			(this.param as GenericEsTreeNode) = new (this.context.getNodeConstructor(param.type))(
				param,
				this,
				this.scope
			);
			this.param!.declare('parameter', UNKNOWN_EXPRESSION);
		}
		super.parseNode(esTreeNode);
	}
}
