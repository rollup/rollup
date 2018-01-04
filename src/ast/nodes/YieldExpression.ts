import ExecutionPathOptions from '../ExecutionPathOptions';
import { BasicExpressionNode, ExpressionNode } from './shared/Expression';

export default class YieldExpression extends BasicExpressionNode {
	type: 'YieldExpression';
	argument: ExpressionNode | null;
	delegate: boolean;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
