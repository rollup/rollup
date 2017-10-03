import Node from '../Node.js';

export default class YieldExpression extends Node {
	hasEffects ( options ) {
		return super.hasEffects( options )
			|| !options.ignoreReturnAwaitYield();
	}
}
