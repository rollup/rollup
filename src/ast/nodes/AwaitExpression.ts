import Node from '../Node';
import Expression from './Expression';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class AwaitExpression extends Node {
	type: 'AwaitExpression';
	argument: Expression;

	hasEffects (options: ExecutionPathOptions) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
