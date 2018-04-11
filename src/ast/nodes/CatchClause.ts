import { GenericEsTreeNode, NodeBase } from './shared/Node';
import CatchScope from '../scopes/CatchScope';
import BlockStatement from './BlockStatement';
import Scope from '../scopes/Scope';
import { PatternNode } from './shared/Pattern';
import { NodeType } from './NodeType';

export default class CatchClause extends NodeBase {
	type: NodeType.CatchClause;
	param: PatternNode;
	body: BlockStatement;

	scope: CatchScope;

	createScope(parentScope: Scope) {
		this.scope = new CatchScope({ parent: parentScope });
	}

	initialise() {
		this.included = false;
		this.param.declare('parameter', null);
	}

	parseNode(esTreeNode: GenericEsTreeNode, nodeConstructors: { [p: string]: typeof NodeBase }) {
		this.body = <BlockStatement>new nodeConstructors.BlockStatement(
			esTreeNode.body,
			nodeConstructors,
			this,
			this.scope,
			true
		);
		super.parseNode(esTreeNode, nodeConstructors);
	}
}
