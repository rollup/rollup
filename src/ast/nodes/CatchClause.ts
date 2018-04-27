import { GenericEsTreeNode, NodeBase } from './shared/Node';
import CatchScope from '../scopes/CatchScope';
import BlockStatement from './BlockStatement';
import Scope from '../scopes/Scope';
import { PatternNode } from './shared/Pattern';
import * as NodeType from './NodeType';

export default class CatchClause extends NodeBase {
	type: NodeType.tCatchClause;
	param: PatternNode;
	body: BlockStatement;

	scope: CatchScope;
	preventChildBlockScope: true;

	createScope(parentScope: Scope) {
		this.scope = new CatchScope({ parent: parentScope });
	}

	initialise() {
		this.included = false;
		this.param.declare('parameter', null);
	}

	parseNode(esTreeNode: GenericEsTreeNode) {
		this.body = <BlockStatement>new this.context.nodeConstructors.BlockStatement(
			esTreeNode.body,
			this,
			this.scope
		);
		super.parseNode(esTreeNode);
	}
}

CatchClause.prototype.preventChildBlockScope = true;
