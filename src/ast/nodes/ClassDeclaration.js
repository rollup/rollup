import Node from '../Node.js';

// TODO is this basically identical to FunctionDeclaration?
export default class ClassDeclaration extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.body.run();
	}

	addReference ( reference ) {
		/* noop? */
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	getName () {
		return this.id.name;
	}

	hasEffects () {
		return false;
	}

	initialise ( scope ) {
		scope.addDeclaration( this.id.name, this, false, false );
		super.initialise( scope );
	}

	render ( code, es ) {
		if ( this.activated ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}
