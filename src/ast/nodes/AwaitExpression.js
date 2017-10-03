import Node from '../Node.js';

export default class AwaitExpression extends Node {
	hasEffects ( options ) {
		return super.hasEffects( options )
			|| !options.ignoreReturnAwaitYield();
	}
}
