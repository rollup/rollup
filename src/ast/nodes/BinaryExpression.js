import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values.js';

const operators = {
	'==': ( left, right ) => left == right,
	'!=': ( left, right ) => left != right,
	'===': ( left, right ) => left === right,
	'!==': ( left, right ) => left !== right,
	'<': ( left, right ) => left < right,
	'<=': ( left, right ) => left <= right,
	'>': ( left, right ) => left > right,
	'>=': ( left, right ) => left >= right,
	'<<': ( left, right ) => left << right,
	'>>': ( left, right ) => left >> right,
	'>>>': ( left, right ) => left >>> right,
	'+': ( left, right ) => left + right,
	'-': ( left, right ) => left - right,
	'*': ( left, right ) => left * right,
	'/': ( left, right ) => left / right,
	'%': ( left, right ) => left % right,
	'|': ( left, right ) => left | right,
	'^': ( left, right ) => left ^ right,
	'&': ( left, right ) => left & right,
	'**': ( left, right ) => Math.pow( left, right ),
	in: ( left, right ) => left in right,
	instanceof: ( left, right ) => left instanceof right
};

export default class BinaryExpression extends Node {
	getValue () {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		const rightValue = this.right.getValue();
		if ( rightValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		if ( !operators[ this.operator ] ) return UNKNOWN_VALUE;

		return operators[ this.operator ]( leftValue, rightValue );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
