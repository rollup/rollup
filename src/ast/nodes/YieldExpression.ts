import { ExecutionPathOptions } from '../ExecutionPathOptions';
import * as NodeType from './NodeType';
import { ExpressionNode, NodeBase } from './shared/Node';

export default class YieldExpression extends NodeBase {
	type: NodeType.tYieldExpression;
	argument: ExpressionNode | null;
	delegate: boolean;

	hasEffects(options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
