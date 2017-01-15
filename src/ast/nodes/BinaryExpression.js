import Node from '../Node.js';
import { unknown } from '../values.js';

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
	in: ( left, right ) => left in right,
	instanceof: ( left, right ) => left instanceof right
};

export default class BinaryExpression extends Node {
	run () {
		const leftValue = this.left.run();
		if ( leftValue === unknown ) return unknown;

		const rightValue = this.right.run();
		if ( rightValue === unknown ) return unknown;

		return operators[ this.operator ]( leftValue, rightValue );
	}
}
