import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values.js';

const operators = {
	'-': value => -value,
	'+': value => +value,
	'!': value => !value,
	'~': value => ~value,
	typeof: value => typeof value,
	void: () => undefined,
	delete: () => UNKNOWN_VALUE
};

export default class UnaryExpression extends Node {
	bind () {
		if ( this.value === UNKNOWN_VALUE ) super.bind();
	}

	getValue () {
		const argumentValue = this.argument.getValue();
		if ( argumentValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		return operators[ this.operator ]( argumentValue );
	}

	hasEffects () {
		return this.included
			|| this.argument.hasEffects()
			|| (this.operator === 'delete' && (
				this.argument.type !== 'MemberExpression'
				|| this.argument.object.hasEffectsWhenMutated()
			));
	}

	initialiseNode () {
		this.value = this.getValue();
	}
}
