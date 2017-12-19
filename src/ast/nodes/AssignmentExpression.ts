import Node from '../Node';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class AssignmentExpression extends Node {
	bindNode () {
		disallowIllegalReassignment( this.scope, this.left );
		this.left.reassignPath( [], ExecutionPathOptions.create() );
	}

	hasEffects ( options ) {
		return super.hasEffects( options ) || this.left.hasEffectsWhenAssignedAtPath( [], options );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 0
			&& this.right.hasEffectsWhenAccessedAtPath( path, options );
	}
}
