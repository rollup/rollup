import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { UnlabeledBreak, UnlabeledContinue } from '../../ExecutionContext';
import type { StatementNode } from './Node';

export function hasLoopBodyEffects(context: HasEffectsContext, body: StatementNode): boolean {
	const {
		brokenFlow,
		includedLabels,
		ignore: { labels }
	} = context;
	const hasBreak = includedLabels.delete(UnlabeledBreak);
	const ignoreBreaks = labels.has(UnlabeledBreak);
	labels.add(UnlabeledBreak);
	const hasContinue = includedLabels.delete(UnlabeledContinue);
	const ignoreContinues = labels.has(UnlabeledContinue);
	labels.add(UnlabeledContinue);
	if (body.hasEffects(context)) return true;
	if (!ignoreBreaks) labels.delete(UnlabeledBreak);
	if (!ignoreContinues) labels.delete(UnlabeledContinue);
	if (hasBreak) {
		includedLabels.add(UnlabeledBreak);
	} else {
		includedLabels.delete(UnlabeledBreak);
	}
	if (hasContinue) {
		includedLabels.add(UnlabeledContinue);
	} else {
		includedLabels.delete(UnlabeledContinue);
	}
	context.brokenFlow = brokenFlow;
	return false;
}

export function includeLoopBody(
	context: InclusionContext,
	body: StatementNode,
	includeChildrenRecursively: boolean | 'variables'
) {
	const { brokenFlow, includedLabels } = context;
	const hasBreak = includedLabels.delete(UnlabeledBreak);
	const hasContinue = includedLabels.delete(UnlabeledContinue);
	body.include(context, includeChildrenRecursively, { asSingleStatement: true });
	if (hasBreak) {
		includedLabels.add(UnlabeledBreak);
	} else {
		includedLabels.delete(UnlabeledBreak);
	}
	if (hasContinue) {
		includedLabels.add(UnlabeledContinue);
	} else {
		includedLabels.delete(UnlabeledContinue);
	}
	context.brokenFlow = brokenFlow;
}
