import { BREAKFLOW_BREAK_CONTINUE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
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
		if (this.discriminant.hasEffects(context)) return true;
		const {
			breakFlow,
			ignore: { breakStatements }
		} = context;
		let hasDefault = false;
		let minBreakFlow = Infinity;
		context.ignore.breakStatements = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			if (switchCase.test === null) hasDefault = true;
			minBreakFlow = context.breakFlow < minBreakFlow ? context.breakFlow : minBreakFlow;
			context.breakFlow = breakFlow;
		}
		if (hasDefault && !(minBreakFlow === BREAKFLOW_BREAK_CONTINUE)) {
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
		let minBreakFlow = Infinity;
		for (const switchCase of this.cases) {
			if (switchCase.test === null) hasDefault = true;
			switchCase.include(context, includeChildrenRecursively);
			minBreakFlow = minBreakFlow < context.breakFlow ? minBreakFlow : context.breakFlow;
			context.breakFlow = breakFlow;
		}
		if (hasDefault && !(minBreakFlow === BREAKFLOW_BREAK_CONTINUE)) {
			context.breakFlow = minBreakFlow;
		}
	}
}
