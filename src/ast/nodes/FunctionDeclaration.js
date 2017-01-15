import Node from '../Node.js';
import { unknown } from '../values.js';

class AsyncFunctionReturnValue {
	constructor ( value ) {
		this.value = value;
	}

	getProperty () {
		// TODO express promise semantics somehow?
		return unknown;
	}
}

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

	call ( context, args ) {
		if ( this.isCalling ) return; // recursive functions
		this.isCalling = true;

		let returnValue;
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
			if ( node.type === 'ReturnStatement' ) {
				returnValue = node.argument ? node.argument.run() : undefined; // TODO represent undefined
				break;
			}
		}

		this.isCalling = false;

		return this.async ? new AsyncFunctionReturnValue( returnValue ) : returnValue;
	}

	gatherPossibleValues ( values ) {
		values.add( this );
	}

	getName () {
		return this.name;
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

	markReturnStatements () {
		this.returnStatements.forEach( statement => statement.mark() );
	}

	render ( code, es ) {
		if ( !this.module.bundle.treeshake || this.activated ) {
			super.render( code, es );
		} else {
			code.remove( this.leadingCommentStart || this.start, this.next || this.end );
		}
	}

	run ( scope ) {
		if ( this.parent.type === 'ExportDefaultDeclaration' ) {
			super.run( scope );
		}
	}
}
