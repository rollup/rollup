import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';
import { RenderOptions } from '../../utils/renderHelpers';
import MagicString from 'magic-string';

export default class AwaitExpression extends NodeBase {
	type: NodeType.tAwaitExpression;
	argument: ExpressionNode;

	hasEffects(options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}

	render(code: MagicString, options: RenderOptions) {
		if (!this.context.inFunction) this.context.usesTopLevelAwait = true;
		super.render(code, options);
	}
}
