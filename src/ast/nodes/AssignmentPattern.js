import Node from '../Node.js';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class AssignmentPattern extends Node {
	bindNode () {
		this.left.bindAssignmentAtPath( [], this.right, ExecutionPathOptions.create() );
	}

	bindAssignmentAtPath ( path, expression, options ) {
		path.length === 0
		&& this.left.bindAssignmentAtPath( path, expression, options );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return path.length > 0
			|| this.left.hasEffectsWhenAssignedAtPath( [], options );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.right.initialise( parentScope );
		this.left.initialiseAndDeclare( parentScope, kind, init );
	}
}
