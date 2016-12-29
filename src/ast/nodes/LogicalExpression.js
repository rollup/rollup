import Node from '../Node.js';
import { UNKNOWN } from '../values.js';

const operators = {
	'&&': ( left, right ) => left && right,
	'||': ( left, right ) => left || right
};

export default class LogicalExpression extends Node {
	getValue () {
		const leftValue = this.left.getValue();
		if ( leftValue === UNKNOWN ) return UNKNOWN;

		const rightValue = this.right.getValue();
		if ( rightValue === UNKNOWN ) return UNKNOWN;

		return operators[ this.operator ]( leftValue, rightValue );
	}
}
