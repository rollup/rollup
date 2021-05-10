import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

export default class YieldExpression extends NodeBase {
	argument!: ExpressionNode | null;
	delegate!: boolean;
	type!: NodeType.tYieldExpression;
	private deoptimized = false;

	hasEffects(context: HasEffectsContext) {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			!context.ignore.returnAwaitYield ||
			(this.argument !== null && this.argument.hasEffects(context))
		);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.argument?.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.argument) {
			this.argument.render(code, options, { preventASI: true });
			if (this.argument.start === this.start + 5 /* 'yield'.length */) {
				code.prependLeft(this.start + 5, ' ');
			}
		}
	}

	private applyDeoptimizations() {
		this.deoptimized = true;
		this.argument?.deoptimizePath(UNKNOWN_PATH);
	}
}
