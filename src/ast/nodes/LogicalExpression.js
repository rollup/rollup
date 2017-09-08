import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values.js';

const operators = {
	'&&': ( left, right ) => left && right,
	'||': ( left, right ) => left || right
};

export default class LogicalExpression extends Node {
	getValue () {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		const rightValue = this.right.getValue();
		if ( rightValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		return operators[ this.operator ]( leftValue, rightValue );
	}

	hasEffectsWhenMutated ( options ) {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) {
			return this.left.hasEffectsWhenMutated( options ) || this.right.hasEffectsWhenMutated( options );
		}
		if ((leftValue && this.operator === '||') || (!leftValue && this.operator === '&&')) {
			return this.left.hasEffectsWhenMutated( options );
		}
		return this.right.hasEffectsWhenMutated( options );
	}
}
