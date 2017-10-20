import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';
import VirtualNumberLiteral from './shared/VirtualNumberLiteral';

export default class UpdateExpression extends Node {
	bindNode () {
		disallowIllegalReassignment( this.scope, this.argument );
		this.argument.bindAssignmentAtPath( [], new VirtualNumberLiteral() );
		if ( this.argument.type === 'Identifier' ) {
			const variable = this.scope.findVariable( this.argument.name );
			variable.isReassigned = true;
		}
	}

	hasEffects ( options ) {
		return this.argument.hasEffects( options )
			|| this.argument.hasEffectsWhenAssignedAtPath( [], options );
	}

	hasEffectsWhenAccessedAtPath ( path ) {
		return path.length > 1;
	}
}
