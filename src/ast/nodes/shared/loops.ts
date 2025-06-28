import type { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import type * as nodes from '../node-unions';

export function hasLoopBodyEffects(context: HasEffectsContext, body: nodes.Statement): boolean {
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
	body: nodes.Statement,
	includeChildrenRecursively: boolean | 'variables'
) {
	const { brokenFlow, hasBreak, hasContinue } = context;
	context.hasBreak = false;
	context.hasContinue = false;
	body.include(context, includeChildrenRecursively, { asSingleStatement: true });
	context.hasBreak = hasBreak;
	context.hasContinue = hasContinue;
	context.brokenFlow = brokenFlow;
}
