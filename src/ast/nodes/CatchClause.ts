import type ChildScope from '../scopes/ChildScope';
import ParameterScope from '../scopes/ParameterScope';
import BlockStatement from './BlockStatement';
import type * as NodeType from './NodeType';
import { UNKNOWN_EXPRESSION } from './shared/Expression';
import { type GenericEsTreeNode, NodeBase } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import { VariableKind } from './shared/VariableKinds';

export default class CatchClause extends NodeBase {
	declare body: BlockStatement;
	declare param: PatternNode | null;
	declare preventChildBlockScope: true;
	declare scope: ParameterScope;
	declare type: NodeType.tCatchClause;

	createScope(parentScope: ChildScope): void {
		this.scope = new ParameterScope(parentScope, this.scope.context, true);
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		const { body, param, type } = esTreeNode;
		this.type = type as NodeType.tCatchClause;
		if (param) {
			(this.param as GenericEsTreeNode) = new (this.scope.context.getNodeConstructor(param.type))(
				param,
				this,
				this.scope
			);
			this.param!.declare(VariableKind.parameter, UNKNOWN_EXPRESSION);
		}
		this.body = new BlockStatement(body, this, this.scope.bodyScope);
		super.parseNode(esTreeNode);
	}
}

CatchClause.prototype.preventChildBlockScope = true;
