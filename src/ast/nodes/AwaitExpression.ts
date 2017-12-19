import Node from '../Node';

export default class AwaitExpression extends Node {
	hasEffects ( options ) {
		return super.hasEffects( options )
			|| !options.ignoreReturnAwaitYield();
	}
}
