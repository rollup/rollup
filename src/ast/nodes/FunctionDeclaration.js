import Function from './shared/Function.js';

export default class FunctionDeclaration extends Function {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.params.forEach( param => param.run() ); // in case of assignment patterns
		this.body.run();
	}

	addReference () {}

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

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.activated ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}

	run () {
		if ( this.parent.type === 'ExportDefaultDeclaration' ) {
			super.run();
		}
	}
}
