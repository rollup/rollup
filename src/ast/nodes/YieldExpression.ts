import ExecutionPathOptions from '../ExecutionPathOptions';
import { GenericExpressionNode, ExpressionNode } from './shared/Expression';

export default class YieldExpression extends GenericExpressionNode {
	type: 'YieldExpression';
	argument: ExpressionNode | null;
	delegate: boolean;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
