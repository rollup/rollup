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

	hasEffectsWhenMutatedAtPath ( path, options ) {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) {
			return this.left.hasEffectsWhenMutatedAtPath( path, options )
				|| this.right.hasEffectsWhenMutatedAtPath( path, options );
		}
		if ( (leftValue && this.operator === '||') || (!leftValue && this.operator === '&&') ) {
			return this.left.hasEffectsWhenMutatedAtPath( path, options );
		}
		return this.right.hasEffectsWhenMutatedAtPath( path, options );
	}
}
