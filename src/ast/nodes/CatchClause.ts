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

	createScope(parentScope: Scope): void {
		this.scope = new CatchScope(parentScope, this.context);
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		// Parameters need to be declared first as the logic is that hoisted body
		// variables are associated with outside vars unless there is a parameter,
		// in which case they are associated with the parameter
		const { param } = esTreeNode;
		if (param) {
			(this.param as GenericEsTreeNode) = new (this.context.nodeConstructors[param.type] ||
				this.context.nodeConstructors.UnknownNode)(param, this, this.scope);
			this.param!.declare('parameter', UNKNOWN_EXPRESSION);
		}
		super.parseNode(esTreeNode);
	}
}
