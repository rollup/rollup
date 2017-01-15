import Node from '../Node.js';
import { unknown } from '../values.js';

const operators = {
	'&&': ( left, right ) => left && right,
	'||': ( left, right ) => left || right
};

export default class LogicalExpression extends Node {
	run () {
		const leftValue = this.left.run();
		if ( leftValue === unknown ) return unknown;

		const rightValue = this.right.run();
		if ( rightValue === unknown ) return unknown;

		return operators[ this.operator ]( leftValue, rightValue );
	}
}
