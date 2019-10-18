import {
	BROKEN_FLOW_BREAK_CONTINUE,
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
		if (this.discriminant.hasEffects(context)) return true;
		const {
			brokenFlow,
			ignore: { breakStatements }
		} = context;
		let hasDefault = false;
		let minBrokenFlow = Infinity;
		context.ignore.breakStatements = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			if (switchCase.test === null) hasDefault = true;
			minBrokenFlow = context.brokenFlow < minBrokenFlow ? context.brokenFlow : minBrokenFlow;
			context.brokenFlow = brokenFlow;
		}
		if (hasDefault && !(minBrokenFlow === BROKEN_FLOW_BREAK_CONTINUE)) {
			context.brokenFlow = minBrokenFlow;
		}
		context.ignore.breakStatements = breakStatements;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.discriminant.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		let hasDefault = false;
		let minBrokenFlow = Infinity;
		for (const switchCase of this.cases) {
			if (switchCase.test === null) hasDefault = true;
			switchCase.include(context, includeChildrenRecursively);
			minBrokenFlow = minBrokenFlow < context.brokenFlow ? minBrokenFlow : context.brokenFlow;
			context.brokenFlow = brokenFlow;
		}
		if (hasDefault && !(minBrokenFlow === BROKEN_FLOW_BREAK_CONTINUE)) {
			context.brokenFlow = minBrokenFlow;
		}
	}
}
