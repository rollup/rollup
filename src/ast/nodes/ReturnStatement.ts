import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { UNKNOWN_EXPRESSION } from '../values';
import * as NodeType from './NodeType';
import { ExpressionNode, StatementBase } from './shared/Node';

export default class ReturnStatement extends StatementBase {
	argument: ExpressionNode | null;
	type: NodeType.tReturnStatement;

	hasEffects(options: ExecutionPathOptions) {
		return (
			!options.ignoreReturnAwaitYield() ||
			((this.argument && this.argument.hasEffects(options)) as boolean)
		);
	}

	initialise() {
		this.included = false;
		this.scope.addReturnExpression(this.argument || UNKNOWN_EXPRESSION);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.argument) {
			this.argument.render(code, options);
			if (this.argument.start === this.start + 6 /* 'return'.length */) {
				code.prependLeft(this.start + 6, ' ');
			}
		}
	}
}
