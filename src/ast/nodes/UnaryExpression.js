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
	bind ( scope ) {
		if ( this.value === unknown ) super.bind( scope );
	}

	getValue () {
		const argumentValue = this.argument.getValue();
		if ( argumentValue === unknown ) return unknown;

		return operators[ this.operator ]( argumentValue );
	}

	hasEffects ( scope ) {
		return this.operator === 'delete' || this.argument.hasEffects( scope );
	}

	initialise ( scope ) {
		this.value = this.getValue();
		if ( this.value === unknown ) super.initialise( scope );
	}
}
