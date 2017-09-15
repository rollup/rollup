import Node from '../Node.js';

export default class ObjectPattern extends Node {
	bindAssignmentAtPath ( path, expression ) {
		this.properties.forEach( child => child.bindAssignmentAtPath( path, expression ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		if ( path.length > 0 ) {
			return true;
		}
		return this.someChild( child => child.hasEffectsWhenAssignedAtPath( [], options ) );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.properties.forEach( child => child.initialiseAndDeclare( parentScope, kind, init ) );
	}
}
