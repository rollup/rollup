import Class from './shared/Class.js';

export default class ClassDeclaration extends Class {
	initialiseChildren ( parentScope ) {
		// Class declarations are like let declarations: Not hoisted, can be reassigned, cannot be redeclared
		this.id && this.id.initialiseAndDeclare( parentScope, 'class', this );
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
