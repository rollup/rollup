import ExecutionPathOptions from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class AwaitExpression extends NodeBase {
	type: NodeType.tAwaitExpression;
	argument: ExpressionNode;

	hasEffects(options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
