import Node from '../Node.js';

export default class AssignmentPattern extends Node {
	bind () {
		super.bind();
		this.left.bindAssignmentAtPath( [], this.right );
	}

	bindAssignmentAtPath ( path, expression ) {
		this.left.bindAssignmentAtPath( path, expression );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.left.hasEffectsWhenAssigned( options );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.right.initialise( parentScope );
		this.left.initialiseAndDeclare( parentScope, kind, init );
	}
}
