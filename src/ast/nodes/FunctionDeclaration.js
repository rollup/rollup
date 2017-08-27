import Function from './shared/Function.js';

export default class FunctionDeclaration extends Function {
	addReference () {}

	assignExpression ( expression ) {
		this.assignedExpressions.add( expression );
		this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	getName () {
		return this.name;
	}

	initialiseChildren ( parentScope ) {
		if ( this.id ) {
			this.name = this.id.name; // may be overridden by bundle.deconflict
			parentScope.addDeclaration( this.name, this, false, false );
			this.id.initialise( parentScope );
		}
		super.initialiseChildren( parentScope );
	}

	hasEffectsWhenMutated () {
		return this.included;
	}

	initialiseNode () {
		this.assignedExpressions = new Set( [ this ] );
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.included ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}
