import Function from './shared/Function.js';

export default class FunctionExpression extends Function {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.params.forEach( param => param.run() ); // in case of assignment patterns
		this.body.run();
	}

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
