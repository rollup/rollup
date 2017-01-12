import Node from '../Node.js';

class Instance {
	constructor ( _class ) {
		this.class = _class;
	}
}

// TODO is this basically identical to FunctionDeclaration?
export default class ClassDeclaration extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		if ( this.superClass ) {
			// TODO is this right?
			this.superClass.activate();
		}

		this.body.mark();

		// TODO don't mark all methods willy-nilly
		this.body.markChildren();
	}

	addReference () {
		/* noop? */
	}

	call ( context, args ) {
		// TODO create a generic context object which represents all instances of this class
		// TODO identify the constructor (may be on a superclass, which may not be a class!)
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	getInstance () {
		return new Instance( this );
	}

	getName () {
		return this.name;
	}

	hasEffects () {
		return false;
	}

	markReturnStatements () {
		// noop?
	}

	initialise ( scope ) {
		this.scope = scope;

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

	run () {
		this.scope.setValue( this.id.name, this );
		super.run();
	}
}
