import ExecutionPathOptions from '../ExecutionPathOptions';
import { NodeType } from './index';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	type: NodeType.AwaitExpression;
	argument: ExpressionNode;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
