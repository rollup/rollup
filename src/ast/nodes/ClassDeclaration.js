import Class from './shared/Class.js';

export default class ClassDeclaration extends Class {
	gatherPossibleValues ( values ) {
		values.add( this );
	}

	hasEffects () {
		return this.included;
	}

	initialiseChildren ( parentScope ) {
		if ( this.id ) {
			this.name = this.id.name;
			parentScope.addDeclaration( this.name, this, false, false );
			this.id.initialise( parentScope );
		}
		super.initialiseChildren( parentScope );
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.included ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}
