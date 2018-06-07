import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class YieldExpression extends NodeBase {
	type: NodeType.tYieldExpression;
	argument: ExpressionNode | null;
	delegate: boolean;

	hasEffects(options: ExecutionPathOptions) {
		return (
			!options.ignoreReturnAwaitYield() || (this.argument && this.argument.hasEffects(options))
		);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.argument) {
			this.argument.render(code, options);
			if (this.argument.start === this.start + 5 /* 'yield'.length */) {
				code.prependLeft(this.start + 5, ' ');
			}
		}
	}
}
