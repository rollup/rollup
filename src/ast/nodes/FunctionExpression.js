import Function from './shared/Function.js';

export default class FunctionExpression extends Function {
	addReference () {}

	getName () {
		return this.name;
	}

	initialiseChildren ( parentScope ) {
		if ( this.id ) {
			this.name = this.id.name; // may be overridden by bundle.deconflict
			this.scope.addDeclaration( this.name, this, false, false );
			this.id.initialise( this.scope );
		}
		super.initialiseChildren( parentScope );
	}
}
