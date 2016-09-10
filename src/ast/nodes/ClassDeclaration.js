import Node from '../Node.js';

// TODO is this basically identical to FunctionDeclaration?
export default class ClassDeclaration extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.body.run();
	}

	addReference () {
		/* noop? */
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	getName () {
		return this.name;
	}

	hasEffects () {
		return false;
	}

	initialise ( scope ) {
		this.name = this.id.name;

		scope.addDeclaration( this.name, this, false, false );
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
