import Node from '../Node.js';
import { unknown } from '../values.js';

const operators = {
	'&&': ( left, right ) => left && right,
	'||': ( left, right ) => left || right
};

export default class LogicalExpression extends Node {
	getValue () {
		const leftValue = this.left.getValue();
		if ( leftValue === unknown ) return unknown;

		const rightValue = this.right.getValue();
		if ( rightValue === unknown ) return unknown;

		return operators[ this.operator ]( leftValue, rightValue );
	}
}
