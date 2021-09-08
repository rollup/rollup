import MagicString from 'magic-string';
import { RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import {
	BROKEN_FLOW_BREAK_CONTINUE,
	createHasEffectsContext,
	HasEffectsContext,
	InclusionContext
} from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import Scope from '../scopes/Scope';
import * as NodeType from './NodeType';
import SwitchCase from './SwitchCase';
import { ExpressionNode, IncludeChildren, StatementBase } from './shared/Node';

export default class SwitchStatement extends StatementBase {
	declare cases: SwitchCase[];
	declare discriminant: ExpressionNode;
	declare type: NodeType.tSwitchStatement;

	private declare defaultCase: number | null;

	createScope(parentScope: Scope): void {
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.discriminant.hasEffects(context)) return true;
		const {
			brokenFlow,
			ignore: { breaks }
		} = context;
		let minBrokenFlow = Infinity;
		context.ignore.breaks = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			minBrokenFlow = context.brokenFlow < minBrokenFlow ? context.brokenFlow : minBrokenFlow;
			context.brokenFlow = brokenFlow;
		}
		if (this.defaultCase !== null && !(minBrokenFlow === BROKEN_FLOW_BREAK_CONTINUE)) {
			context.brokenFlow = minBrokenFlow;
		}
		context.ignore.breaks = breaks;
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.discriminant.include(context, includeChildrenRecursively);
		const { brokenFlow } = context;
		let minBrokenFlow = Infinity;
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
				minBrokenFlow = minBrokenFlow < context.brokenFlow ? minBrokenFlow : context.brokenFlow;
				context.brokenFlow = brokenFlow;
			} else {
				minBrokenFlow = brokenFlow;
			}
		}
		if (
			isCaseIncluded &&
			this.defaultCase !== null &&
			!(minBrokenFlow === BROKEN_FLOW_BREAK_CONTINUE)
		) {
			context.brokenFlow = minBrokenFlow;
		}
	}

	initialise(): void {
		for (let caseIndex = 0; caseIndex < this.cases.length; caseIndex++) {
			if (this.cases[caseIndex].test === null) {
				this.defaultCase = caseIndex;
				return;
			}
		}
		this.defaultCase = null;
	}

	render(code: MagicString, options: RenderOptions): void {
		this.discriminant.render(code, options);
		if (this.cases.length > 0) {
			renderStatementList(this.cases, code, this.cases[0].start, this.end - 1, options);
		}
	}
}
