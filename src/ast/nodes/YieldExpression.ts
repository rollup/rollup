import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import { type ExpressionNode, NodeBase } from './shared/Node';

export default class YieldExpression extends NodeBase {
	declare argument: ExpressionNode | null;
	declare delegate: boolean;
	declare type: NodeType.tYieldExpression;
	protected deoptimized = false;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			!context.ignore.returnYield || (this.argument !== null && this.argument.hasEffects(context))
		);
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.argument) {
			this.argument.render(code, options, { preventASI: true });
			if (this.argument.start === this.start + 5 /* 'yield'.length */) {
				code.prependLeft(this.start + 5, ' ');
			}
		}
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		const { argument } = this;
		if (argument) {
			argument.deoptimizePath(UNKNOWN_PATH);
			this.context.requestTreeshakingPass();
		}
	}
}
