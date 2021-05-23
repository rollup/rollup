import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext } from '../ExecutionContext';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class YieldExpression extends NodeBase {
	argument!: ExpressionNode | null;
	delegate!: boolean;
	type!: NodeType.tYieldExpression;
	protected deoptimized = false;

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return (
			!context.ignore.returnAwaitYield ||
			(this.argument !== null && this.argument.hasEffects(context))
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
		this.argument?.deoptimizePath(UNKNOWN_PATH);
	}
}
