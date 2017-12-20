import Node from '../Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Expression from './Expression';

export default class YieldExpression extends Node {
	type: 'YieldExpression';
	argument: Expression | null;
	delegate: boolean;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
