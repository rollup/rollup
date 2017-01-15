import Node from '../Node.js';
import { unknown } from '../values.js';

const operators = {
	"-": value => -value,
	"+": value => +value,
	"!": value => !value,
	"~": value => ~value,
	typeof: value => typeof value,
	void: () => undefined,
	delete: () => unknown
};

export default class UnaryExpression extends Node {
	hasEffects ( scope ) {
		return this.operator === 'delete' || this.argument.hasEffects( scope );
	}

	run () {
		const argumentValue = this.argument.run();
		if ( argumentValue === unknown ) return unknown;

		return operators[ this.operator ]( argumentValue );
	}
}
