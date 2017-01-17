import Node from '../Node.js';
import extractNames from '../utils/extractNames.js';
import { unknown, Undefined } from '../values.js';

class DeclaratorProxy {
	constructor ( name, declarator, isTopLevel, init ) {
		this.isDeclaratorProxy = true;
		this.name = name;
		this.declarator = declarator;

		this.activated = false;
		this.isReassigned = false;
		this.exportName = null;

		this.duplicates = [];
		this.possibleValues = new Set( init ? [ init ] : null );
	}

	activate () {
		this.activated = true;
		this.declarator.activate();
		this.duplicates.forEach( dupe => dupe.activate() );
	}

	addReference () {
		/* noop? */
	}

	gatherPossibleValues ( values ) {
		this.possibleValues.forEach( value => values.add( value ) );
	}

	getName ( es ) {
		// TODO desctructuring...
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	markChildrenIndiscriminately () {
		this.declarator.markChildrenIndiscriminately();
	}

	toString () {
		return this.name;
	}
}

export default class VariableDeclarator extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		console.log( `activating ${this}` )

		this.mark();
		if ( this.init ) this.init.markChildren();
	}

	hasEffects ( scope ) {
		return this.init && this.init.hasEffects( scope );
	}

	initialise ( scope ) {
		this.scope = scope;
		this.proxies = new Map();

		const lexicalBoundary = scope.findLexicalBoundary();

		const init = this.init ?
			( this.id.type === 'Identifier' ? this.init : unknown ) : // TODO maybe unknown is unnecessary
			null;

		extractNames( this.id ).forEach( name => {
			const proxy = new DeclaratorProxy( name, this, lexicalBoundary.isModuleScope, init );

			this.proxies.set( name, proxy );
			scope.addDeclaration( name, proxy, this.parent.kind === 'var' );
		});

		super.initialise( scope );
	}

	render ( code, es ) {
		extractNames( this.id ).forEach( name => {
			const declaration = this.proxies.get( name );

			if ( !es && declaration.exportName && declaration.isReassigned ) {
				if ( this.init ) {
					code.overwrite( this.start, this.id.end, declaration.getName( es ) );
				} else if ( this.module.bundle.treeshake ) {
					code.remove( this.start, this.end );
				}
			}
		});

		super.render( code, es );
	}

	run () {
		if ( this.id.type !== 'Identifier' ) {
			throw new Error( 'TODO desctructuring' );
		}

		if ( this.init ) {
			this.scope.setValue( this.id.name, this.init.run() );
		} else if ( this.parent.kind !== 'var' && !/For(?:In|Of)Statement/.test( this.parent.parent.type ) ) {
			this.scope.setValue( this.id.name, new Undefined() ); // no longer TDZ violation
		}
	}
}
