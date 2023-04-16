import type MagicString from 'magic-string';
import { type RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import {
	createHasEffectsContext,
	type HasEffectsContext,
	type InclusionContext,
	UnlabeledBreak
} from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type Scope from '../scopes/Scope';
import type * as NodeType from './NodeType';
import type SwitchCase from './SwitchCase';
import { type ExpressionNode, type IncludeChildren, StatementBase } from './shared/Node';

export default class SwitchStatement extends StatementBase {
	declare cases: readonly SwitchCase[];
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
			includedLabels,
			ignore: { labels }
		} = context;
		const ignoreBreaks = labels.has(UnlabeledBreak);
		labels.add(UnlabeledBreak);
		const hasBreak = includedLabels.delete(UnlabeledBreak);
		let onlyHasBrokenFlow = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			// eslint-disable-next-line unicorn/consistent-destructuring
			onlyHasBrokenFlow &&= context.brokenFlow && !includedLabels.has(UnlabeledBreak);
			includedLabels.delete(UnlabeledBreak);
			context.brokenFlow = brokenFlow;
		}
		if (this.defaultCase !== null) {
			context.brokenFlow = onlyHasBrokenFlow;
		}
		if (hasBreak) {
			includedLabels.add(UnlabeledBreak);
		}
		if (!ignoreBreaks) labels.delete(UnlabeledBreak);
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.discriminant.include(context, includeChildrenRecursively);
		const { brokenFlow, includedLabels } = context;
		const hasBreak = includedLabels.delete(UnlabeledBreak);
		let onlyHasBrokenFlow = true;
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
				hasEffectsContext.ignore.labels.add(UnlabeledBreak);
				isCaseIncluded = switchCase.hasEffects(hasEffectsContext);
			}
			if (isCaseIncluded) {
				switchCase.include(context, includeChildrenRecursively);
				// eslint-disable-next-line unicorn/consistent-destructuring
				onlyHasBrokenFlow &&= context.brokenFlow && !includedLabels.has(UnlabeledBreak);
				includedLabels.delete(UnlabeledBreak);
				context.brokenFlow = brokenFlow;
			} else {
				onlyHasBrokenFlow = brokenFlow;
			}
		}
		if (isCaseIncluded && this.defaultCase !== null) {
			context.brokenFlow = onlyHasBrokenFlow;
		}
		if (hasBreak) {
			includedLabels.add(UnlabeledBreak);
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
