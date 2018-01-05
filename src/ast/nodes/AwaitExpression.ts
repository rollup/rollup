import ExecutionPathOptions from '../ExecutionPathOptions';
import { GenericExpressionNode, ExpressionNode } from './shared/Expression';

export default class AwaitExpression extends GenericExpressionNode {
	type: 'AwaitExpression';
	argument: ExpressionNode;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
