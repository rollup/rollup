import Node from '../Node';

export default class YieldExpression extends Node {
	hasEffects (options) {
		return super.hasEffects(options) || !options.ignoreReturnAwaitYield();
	}
}
