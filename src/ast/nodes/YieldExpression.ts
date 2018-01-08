import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionBase, ExpressionNode } from './shared/Expression';

export default class YieldExpression extends ExpressionBase {
	type: 'YieldExpression';
	argument: ExpressionNode | null;
	delegate: boolean;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
