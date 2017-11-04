import Node from '../Node.js';
import { UNKNOWN_VALUE } from '../values';
import UndefinedIdentifier from './shared/UndefinedIdentifier';
import ExecutionPathOptions from '../ExecutionPathOptions';

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
	bindNode () {
		if ( this.operator === 'delete' ) {
			this.argument.bindAssignmentAtPath( [], new UndefinedIdentifier(), ExecutionPathOptions.create() );
		}
	}

	getValue () {
		const argumentValue = this.argument.getValue();
		if ( argumentValue === UNKNOWN_VALUE ) return UNKNOWN_VALUE;

		return operators[ this.operator ]( argumentValue );
	}

	hasEffects ( options ) {
		return this.argument.hasEffects( options )
			|| (this.operator === 'delete' && this.argument.hasEffectsWhenAssignedAtPath( [], options ));
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
