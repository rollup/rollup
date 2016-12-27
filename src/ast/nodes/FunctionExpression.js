import Node from '../Node.js';

export default class FunctionExpression extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		const scope = this.body.scope;
		this.params.forEach( param => param.run( scope ) ); // in case of assignment patterns
		this.body.run();
	}

	addReference () {
		/* noop? */
	}

	bind () {
		if ( this.id ) this.id.bind( this.body.scope );
		this.params.forEach( param => param.bind( this.body.scope ) );
		this.body.bind();
	}

	getName () {
		return this.name;
	}

	hasEffects () {
		return false;
	}

	initialise ( scope ) {
		this.name = this.id && this.id.name; // may be overridden by bundle.deconflict
		this.body.createScope( scope );

		if ( this.id ) {
			this.id.initialise( this.body.scope );
			this.body.scope.addDeclaration( this.id.name, this, false, false );
		}

		this.params.forEach( param => param.initialise( this.body.scope ) );
		this.body.initialise();
	}
}
