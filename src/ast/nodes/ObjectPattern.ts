import Node from '../Node';

export default class ObjectPattern extends Node {
	reassignPath ( path, options ) {
		path.length === 0
		&& this.properties.forEach( child => child.reassignPath( path, options ) );
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
