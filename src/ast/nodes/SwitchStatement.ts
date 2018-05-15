import BlockScope from '../scopes/BlockScope';
import SwitchCase from './SwitchCase';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import Scope from '../scopes/Scope';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';

export default class SwitchStatement extends StatementBase {
	type: NodeType.tSwitchStatement;
	discriminant: ExpressionNode;
	cases: SwitchCase[];

	createScope(parentScope: Scope) {
		this.scope = new BlockScope({ parent: parentScope });
	}

	hasEffects(options: ExecutionPathOptions) {
		return super.hasEffects(options.setIgnoreBreakStatements());
	}
}
