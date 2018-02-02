import BlockScope from '../scopes/BlockScope';
import SwitchCase from './SwitchCase';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { NodeType } from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class SwitchStatement extends NodeBase {
	type: NodeType.SwitchStatement;
	discriminant: ExpressionNode;
	cases: SwitchCase[];

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options.setIgnoreBreakStatements());
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
