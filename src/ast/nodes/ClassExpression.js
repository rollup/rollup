import Node from '../Node.js';
import Scope from '../scopes/Scope.js';

export default class ClassExpression extends Node {
	bind () {
		super.bind( this.scope );
	}

	findScope () {
		return this.scope;
	}

	initialise () {
		this.scope = new Scope({
			isBlockScope: true,
			parent: this.parent.findScope( false )
		});

		if ( this.id ) {
			// function expression IDs belong to the child scope...
			this.scope.addDeclaration( this.id.name, this, false, true );
		}

		super.initialise( this.scope );
	}
}
