import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, StatementBase } from './shared/Node';
import SwitchCase from './SwitchCase';

export default class SwitchStatement extends StatementBase {
	cases!: SwitchCase[];
	discriminant!: ExpressionNode;
	type!: NodeType.tSwitchStatement;

	createScope(parentScope: Scope) {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext) {
		const ignoreBreakStatements = context.ignore.breakStatements;
		context.ignore.breakStatements = true;
		if (super.hasEffects(context)) return true;
		context.ignore.breakStatements = ignoreBreakStatements;
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren, context: InclusionContext) {
		this.included = true;
		this.discriminant.include(includeChildrenRecursively, context);
		const breakFlow = context.breakFlow;
		for (const switchCase of this.cases) {
			switchCase.include(includeChildrenRecursively, context);
			context.breakFlow = breakFlow;
		}
	}
}
