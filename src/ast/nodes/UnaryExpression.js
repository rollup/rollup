import Node from '../Node.js';
import { UNKNOWN } from '../values.js';

const operators = {
	'-': value => -value,
	'+': value => +value,
	'!': value => !value,
	'~': value => ~value,
	typeof: value => typeof value,
	void: () => undefined,
	delete: () => UNKNOWN
};

export default class UnaryExpression extends Node {
	bind () {
		if ( this.value === UNKNOWN ) super.bind();
	}

	getValue () {
		const argumentValue = this.argument.getValue();
		if ( argumentValue === UNKNOWN ) return UNKNOWN;

		return operators[ this.operator ]( argumentValue );
	}

	hasEffects () {
		return this.operator === 'delete' || this.argument.hasEffects();
	}

	initialiseNode () {
		this.value = this.getValue();
	}
}
