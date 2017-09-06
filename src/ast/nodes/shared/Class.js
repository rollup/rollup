import Node from '../../Node.js';
import BlockScope from '../../scopes/BlockScope';

export default class Class extends Node {
	hasEffects ( options ) {
		return this.included || (this.id && this.id.hasEffects( options ));
	}

	initialiseChildren () {
		if ( this.superClass ) {
			this.superClass.initialise( this.scope );
		}
		this.body.initialise( this.scope );
	}

	initialiseScope ( parentScope ) {
		this.scope = new BlockScope( { parent: parentScope } );
	}
}
