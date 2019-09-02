import { ExecutionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';
import SwitchCase from './SwitchCase';

export default class SwitchStatement extends StatementBase {
	cases!: SwitchCase[];
	discriminant!: ExpressionNode;
	type!: NodeType.tSwitchStatement;

	createScope(parentScope: Scope) {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: ExecutionContext) {
		const ignoreBreakStatements = context.ignoreBreakStatements;
		context.ignoreBreakStatements = true;
		if (super.hasEffects(context)) return true;
		context.ignoreBreakStatements = ignoreBreakStatements;
		return false;
	}
}
