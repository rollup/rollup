import ExecutionPathOptions from '../ExecutionPathOptions';
import { BasicExpressionNode, ExpressionNode } from './shared/Expression';

export default class AwaitExpression extends BasicExpressionNode {
	type: 'AwaitExpression';
	argument: ExpressionNode;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
