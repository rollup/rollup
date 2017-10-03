import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values';
import UndefinedIdentifier from './shared/UndefinedIdentifier';

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
		if ( this.operator === 'delete' ) {
			this.argument.bindAssignmentAtPath( [], new UndefinedIdentifier() );
		}
	}

	getValue () {
		const argumentValue = this.argument.getValue();
		if ( argumentValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		return operators[ this.operator ]( argumentValue );
	}

	hasEffects ( options ) {
		return this.included
			|| this.argument.hasEffects( options )
			|| (this.operator === 'delete' && (
				this.argument.type !== 'MemberExpression'
				|| this.argument.object.hasEffectsWhenMutatedAtPath( [], options )
			));
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		if ( this.operator === 'void' ) {
			return path.length > 0;
		}
		return path.length > 1;
	}

	initialiseNode () {
		this.value = this.getValue();
	}
}
