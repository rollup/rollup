import Node from '../Node.js';

export default class AssignmentPattern extends Node {
	bindAssignment ( expression ) {
		this.left.bindAssignment( expression );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.left.hasEffectsWhenAssigned( options );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.right.initialise( parentScope );
		this.left.initialiseAndDeclare( parentScope, kind, init || this.right );
	}
}
