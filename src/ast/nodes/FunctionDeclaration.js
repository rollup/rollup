import Function from './shared/Function.js';

export default class FunctionDeclaration extends Function {
	gatherPossibleValues ( values ) {
		values.add( this );
	}

	initialiseChildren ( parentScope ) {
		this.id && this.id.initialiseAndDeclare( parentScope, 'var', this );
		super.initialiseChildren( parentScope );
	}

	hasEffectsWhenMutated () {
		return this.included;
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.included ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}
}
