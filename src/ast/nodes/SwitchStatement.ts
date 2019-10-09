import {
	BreakFlow,
	BREAKFLOW_ERROR_RETURN,
	BREAKFLOW_NONE,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
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
		let hasDefault = false;
		let minBreakFlow: BreakFlow | false = BREAKFLOW_ERROR_RETURN;
		for (const switchCase of this.cases) {
			if (switchCase.test === null) hasDefault = true;
			switchCase.include(includeChildrenRecursively, context);
			if (!(minBreakFlow && context.breakFlow)) {
				minBreakFlow = BREAKFLOW_NONE;
			} else if (minBreakFlow instanceof Set) {
				if (context.breakFlow instanceof Set) {
					for (const label of context.breakFlow) {
						minBreakFlow.add(label);
					}
				}
			} else {
				minBreakFlow = context.breakFlow;
			}
			context.breakFlow = breakFlow;
		}
		if (hasDefault && !(minBreakFlow instanceof Set && minBreakFlow.has(null))) {
			context.breakFlow = minBreakFlow;
		}
	}
}
