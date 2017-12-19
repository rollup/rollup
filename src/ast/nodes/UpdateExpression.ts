import Node from '../Node';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class UpdateExpression extends Node {
	bindNode () {
		disallowIllegalReassignment( this.scope, this.argument );
		this.argument.reassignPath( [], ExecutionPathOptions.create() );
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
