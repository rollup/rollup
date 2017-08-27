import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';

export default class UpdateExpression extends Node {
	bind () {
		disallowIllegalReassignment( this.scope, this.argument );
		if ( this.argument.type === 'Identifier' ) {
			const declaration = this.scope.findDeclaration( this.argument.name );
			declaration.isReassigned = true;
		}
		super.bind();
	}

	hasEffects () {
		return this.included || this.argument.hasEffectsWhenAssigned();
	}
}
