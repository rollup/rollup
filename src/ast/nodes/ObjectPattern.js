import Node from '../Node.js';

export default class ObjectPattern extends Node {
	assignExpression ( expression ) {
		this.properties.forEach( child => child.assignExpression( expression ) );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.someChild( child => child.hasEffectsWhenAssigned( options ) );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.properties.forEach( child => child.initialiseAndDeclare( parentScope, kind, init ) );
	}
}
