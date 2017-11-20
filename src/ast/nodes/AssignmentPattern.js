import Node from '../Node.js';
import ExecutionPathOptions from '../ExecutionPathOptions';

export default class AssignmentPattern extends Node {
	bindNode () {
		this.left.reassignPath( [], ExecutionPathOptions.create() );
	}

	reassignPath ( path, options ) {
		path.length === 0
		&& this.left.reassignPath( path, options );
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
