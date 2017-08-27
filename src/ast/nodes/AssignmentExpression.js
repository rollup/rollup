import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';

export default class AssignmentExpression extends Node {
	bind () {
		super.bind();
		disallowIllegalReassignment( this.scope, this.left );
		this.left.assignExpression( this.right );
	}

	hasEffects () {
		return super.hasEffects() || this.left.hasEffectsWhenAssigned();
	}

	hasEffectsWhenMutated () {
		return true;
	}
}
