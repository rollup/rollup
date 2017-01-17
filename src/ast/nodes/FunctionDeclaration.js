import Node from '../Node.js';
import { unknown } from '../values.js';
import FunctionValue from './shared/FunctionValue.js';

export default class FunctionDeclaration extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.body.mark();
	}

	addReference () {
		/* noop? */
	}

	bind ( scope ) {
		this.id.bind( scope );
		this.params.forEach( param => param.bind( this.body.scope ) );
		this.body.bind( scope );
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	getName () {
		return this.name;
	}

	getProperty () {
		return unknown; // TODO handle added properties, plus things like call, apply, length
	}

	hasEffects () {
		return false;
	}

	initialise ( scope ) {
		this.name = this.id.name; // may be overridden by bundle.deconflict
		scope.addDeclaration( this.name, this, false, false );

		this.body.createScope( scope );

		this.returnStatements = [];

		this.id.initialise( scope );
		this.params.forEach( param => param.initialise( this.body.scope ) );
		this.body.initialise();
	}

	reify () {
		return new FunctionValue( this );
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.activated ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}

	run () {
		// noop
	}
}
