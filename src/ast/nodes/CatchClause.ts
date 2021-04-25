import CatchScope from '../scopes/CatchScope';
import Scope from '../scopes/Scope';
import BlockStatement from './BlockStatement';
import * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { GenericEsTreeNode, NodeBase } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class CatchClause extends NodeBase {
	body!: BlockStatement;
	param!: PatternNode | null;
	preventChildBlockScope!: true;
	scope!: CatchScope;
	type!: NodeType.tCatchClause;

	createScope(parentScope: Scope) {
		this.scope = new CatchScope(parentScope, this.context);
	}

	initialise() {
		if (this.param) {
			this.param.declare('parameter', UNKNOWN_EXPRESSION);
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		this.body = new this.context.nodeConstructors.BlockStatement(
			esTreeNode.body,
			this,
			this.scope
		) as BlockStatement;
		super.parseNode(esTreeNode);
	}
}

CatchClause.prototype.preventChildBlockScope = true;
