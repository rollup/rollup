import Node from '../Node.js';

export default class ObjectPattern extends Node {
	bindAssignmentAtPath ( path, expression, options ) {
		path.length === 0
		&& this.properties.forEach( child => child.bindAssignmentAtPath( path, expression, options ) );
	}

	hasEffectsWhenAssignedAtPath ( path, options ) {
		return path.length > 0
			|| this.someChild( child => child.hasEffectsWhenAssignedAtPath( [], options ) );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.properties.forEach( child => child.initialiseAndDeclare( parentScope, kind, init ) );
	}
}
