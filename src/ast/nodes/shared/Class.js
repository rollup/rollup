import Node from '../../Node.js';
import Scope from '../../scopes/Scope.js';

export default class Class extends Node {
	hasEffects () {
		return this.included || (this.id && this.id.hasEffects());
	}

	initialiseChildren () {
		if ( this.superClass ) {
			this.superClass.initialise( this.scope );
		}
		this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new Scope( {
			parent: parentScope,
			isBlockScope: true
		} );
	}
}
