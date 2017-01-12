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

	call ( context, args ) {
		if ( this.isCalling ) return; // recursive functions
		this.isCalling = true;

		this.body.scope.initialise();

		args.forEach( ( arg, i ) => {
			const param = this.params[i];

			if ( !param ) return;

			if ( param.type !== 'Identifier' ) {
				throw new Error( 'TODO desctructuring' );
			}

			this.body.scope.setValue( param.name, arg );
		});

		for ( const node of this.body.body ) {
			node.run();
		}

		this.isCalling = false;
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

		this.returnStatements = [];

		this.params.forEach( param => param.initialise( this.body.scope ) );
		this.body.initialise();
	}

	mark () {
		this.body.mark();
		super.mark();
	}

	markReturnStatements () {
		this.returnStatements.forEach( statement => statement.mark() );
	}
}
