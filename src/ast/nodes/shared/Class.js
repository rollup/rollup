import Node from '../../Node.js';
import Scope from '../../scopes/Scope.js';

export default class ClassExpression extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		if ( this.superClass ) this.superClass.run();
		this.body.run();
	}

	addReference () {}

	getName () {
		return this.name;
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
