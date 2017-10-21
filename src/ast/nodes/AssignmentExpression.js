import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';

export default class AssignmentExpression extends Node {
	bindNode () {
		disallowIllegalReassignment( this.scope, this.left );
		this.left.bindAssignmentAtPath( [], this.right );
	}

	hasEffects ( options ) {
		return super.hasEffects( options ) || this.left.hasEffectsWhenAssignedAtPath( [], options );
	}

	hasEffectsWhenAccessedAtPath ( path, options ) {
		return path.length > 0
			&& this.right.hasEffectsWhenAccessedAtPath( path, options );
	}
}
