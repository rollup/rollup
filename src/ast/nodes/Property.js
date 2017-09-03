import Node from '../Node.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

export default class Property extends Node {
	assignExpression () {
		this.value.assignExpression( UNKNOWN_ASSIGNMENT );
	}

	hasEffectsWhenAssigned ( options ) {
		return this.value.hasEffectsWhenAssigned( options );
	}

	initialiseAndDeclare ( parentScope, kind, init ) {
		this.initialiseScope( parentScope );
		this.value.initialiseAndDeclare( parentScope, kind, init && UNKNOWN_ASSIGNMENT );
	}

	render ( code, es ) {
		if ( !this.shorthand ) {
			this.key.render( code, es );
		}
		this.value.render( code, es );
	}
}
