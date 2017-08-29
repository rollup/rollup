import Node from '../Node.js';
import disallowIllegalReassignment from './shared/disallowIllegalReassignment.js';

export default class AssignmentExpression extends Node {
	bind () {
		super.bind();
		disallowIllegalReassignment( this.scope, this.left );
		this.left.assignExpression( this.right );
	}

	hasEffects ( options ) {
		return super.hasEffects( options ) || this.left.hasEffectsWhenAssigned( options );
	}

	hasEffectsAsExpressionStatement ( options ) {
		return this.hasEffects( options );
	}

	hasEffectsWhenMutated () {
		return true;
	}
}
