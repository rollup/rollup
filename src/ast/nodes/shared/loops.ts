import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { UNKNOWN_PATH } from '../../utils/PathTracker';
import type { StatementNode } from './Node';

export function hasLoopBodyEffects(context: HasEffectsContext, body: StatementNode): boolean {
	const { brokenFlow, hasBreak, hasContinue, ignore } = context;
	const { breaks, continues } = ignore;
	ignore.breaks = true;
	ignore.continues = true;
	context.hasBreak = false;
	context.hasContinue = false;
	if (body.hasEffects(context)) return true;
	ignore.breaks = breaks;
	ignore.continues = continues;
	context.hasBreak = hasBreak;
	context.hasContinue = hasContinue;
	context.brokenFlow = brokenFlow;
	return false;
}

export function includeLoopBody(
	context: InclusionContext,
	body: StatementNode,
	includeChildrenRecursively: boolean | 'variables'
) {
	const { brokenFlow, hasBreak, hasContinue } = context;
	context.hasBreak = false;
	context.hasContinue = false;
	body.includePath(UNKNOWN_PATH, context, includeChildrenRecursively, { asSingleStatement: true });
	context.hasBreak = hasBreak;
	context.hasContinue = hasContinue;
	context.brokenFlow = brokenFlow;
}
