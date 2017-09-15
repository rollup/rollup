import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';

export default class UpdateExpression extends Node {
	bind () {
		disallowIllegalReassignment( this.scope, this.argument );
		if ( this.argument.type === 'Identifier' ) {
			const variable = this.scope.findVariable( this.argument.name );
			variable.isReassigned = true;
		}
		super.bind();
	}

	hasEffects ( options ) {
		return this.included || this.argument.hasEffectsWhenAssignedAtPath( [], options );
	}

	hasEffectsAsExpressionStatement ( options ) {
		return this.hasEffects( options );
	}
}
