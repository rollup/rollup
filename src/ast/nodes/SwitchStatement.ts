import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import {
	BreakFlow,
	BREAKFLOW_ERROR_RETURN,
	BREAKFLOW_NONE,
	createHasEffectsContext,
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

	private defaultCase!: number | null;

	createScope(parentScope: Scope) {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext) {
		if (this.discriminant.hasEffects(context)) return true;
		const {
			breakFlow,
			ignore: { breaks }
		} = context;
		let minBreakFlow: BreakFlow | false = BREAKFLOW_ERROR_RETURN;
		context.ignore.breaks = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			minBreakFlow = getMinBreakflowAfterCase(minBreakFlow, context);
			context.breakFlow = breakFlow;
		}
		if (this.defaultCase !== null && !(minBreakFlow instanceof Set && minBreakFlow.has(null))) {
			context.breakFlow = minBreakFlow;
		}
		context.ignore.breaks = breaks;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		this.discriminant.include(context, includeChildrenRecursively);
		const { breakFlow } = context;
		let minBreakFlow: BreakFlow | false = BREAKFLOW_ERROR_RETURN;
		let isCaseIncluded =
			includeChildrenRecursively ||
			(this.defaultCase !== null && this.defaultCase < this.cases.length - 1);
		for (let caseIndex = this.cases.length - 1; caseIndex >= 0; caseIndex--) {
			const switchCase = this.cases[caseIndex];
			if (switchCase.included) {
				isCaseIncluded = true;
			}
			if (!isCaseIncluded) {
				const hasEffectsContext = createHasEffectsContext();
				hasEffectsContext.ignore.breaks = true;
				isCaseIncluded = switchCase.hasEffects(hasEffectsContext);
			}
			if (isCaseIncluded) {
				switchCase.include(context, includeChildrenRecursively);
				minBreakFlow = getMinBreakflowAfterCase(minBreakFlow, context);
				context.breakFlow = breakFlow;
			}
		}
		if (this.defaultCase !== null && !(minBreakFlow instanceof Set && minBreakFlow.has(null))) {
			context.breakFlow = minBreakFlow;
		}
	}

	initialise() {
		for (let caseIndex = 0; caseIndex < this.cases.length; caseIndex++) {
			if (this.cases[caseIndex].test === null) {
				this.defaultCase = caseIndex;
				return;
			}
		}
		this.defaultCase = null;
	}

	render(code: MagicString, options: RenderOptions) {
		this.discriminant.render(code, options);
		if (this.cases.length > 0) {
			renderStatementList(this.cases, code, this.cases[0].start, this.end - 1, options);
		}
	}
}
