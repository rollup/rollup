import BlockScope from '../scopes/BlockScope';
import SwitchCase from './SwitchCase';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import { BasicStatementNode } from './shared/Statement';
import { ExpressionNode } from './shared/Expression';

export default class SwitchStatement extends BasicStatementNode {
	type: 'SwitchStatement';
	discriminant: ExpressionNode;
	cases: SwitchCase[];

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options.setIgnoreBreakStatements());
	}

	initialiseScope (parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}
}
