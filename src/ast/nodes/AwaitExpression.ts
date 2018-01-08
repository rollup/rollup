import ExecutionPathOptions from '../ExecutionPathOptions';
import { ExpressionBase, ExpressionNode } from './shared/Expression';

export default class AwaitExpression extends ExpressionBase {
	type: 'AwaitExpression';
	argument: ExpressionNode;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
