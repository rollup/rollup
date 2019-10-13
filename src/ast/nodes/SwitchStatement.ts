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

function getMinBreakflowAfterCase(
	minBreakFlow: BreakFlow | false,
	context: InclusionContext
): BreakFlow | false {
	if (!(minBreakFlow && context.breakFlow)) {
		return BREAKFLOW_NONE;
	}
	if (minBreakFlow instanceof Set) {
		if (context.breakFlow instanceof Set) {
			for (const label of context.breakFlow) {
				minBreakFlow.add(label);
			}
		}
		return minBreakFlow;
	}
	return context.breakFlow;
}

export default class SwitchStatement extends StatementBase {
	cases!: SwitchCase[];
	discriminant!: ExpressionNode;
	type!: NodeType.tSwitchStatement;

	createScope(parentScope: Scope) {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext) {
		if (this.discriminant.hasEffects(context)) return true;
		const {
			breakFlow,
			ignore: { breakStatements }
		} = context;
		let hasDefault = false;
		let minBreakFlow: BreakFlow | false = BREAKFLOW_ERROR_RETURN;
		context.ignore.breakStatements = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			if (switchCase.test === null) hasDefault = true;
			minBreakFlow = getMinBreakflowAfterCase(minBreakFlow, context);
			context.breakFlow = breakFlow;
		}
		if (hasDefault && !(minBreakFlow instanceof Set && minBreakFlow.has(null))) {
			context.breakFlow = minBreakFlow;
		}
		context.ignore.breakStatements = breakStatements;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.discriminant.include(context, includeChildrenRecursively);
		const { breakFlow } = context;
		let hasDefault = false;
		let minBreakFlow: BreakFlow | false = BREAKFLOW_ERROR_RETURN;
		for (const switchCase of this.cases) {
			if (switchCase.test === null) hasDefault = true;
			switchCase.include(context, includeChildrenRecursively);
			minBreakFlow = getMinBreakflowAfterCase(minBreakFlow, context);
			context.breakFlow = breakFlow;
		}
		if (hasDefault && !(minBreakFlow instanceof Set && minBreakFlow.has(null))) {
			context.breakFlow = minBreakFlow;
		}
	}
}
