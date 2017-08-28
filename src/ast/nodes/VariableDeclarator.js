import Node from '../Node.js';
import extractNames from '../utils/extractNames.js';
import { UNKNOWN_ASSIGNMENT } from '../values';

class DeclaratorProxy {
	constructor ( name, declarator, isTopLevel, init ) {
		this.name = name;
		this.declarator = declarator;

		this.isReassigned = false;
		this.exportName = null;

		this.duplicates = [];
		this.assignedExpressions = new Set( init ? [ init ] : null );
	}

	addReference () {
		/* noop? */
	}

	assignExpression ( expression ) {
		this.assignedExpressions.add( expression );
		this.isReassigned = true;
	}

	gatherPossibleValues ( values ) {
		this.assignedExpressions.forEach( value => values.add( value ) );
	}

	getName ( es ) {
		// TODO destructuring...
		if ( es ) return this.name;
		if ( !this.isReassigned || !this.exportName ) return this.name;

		return `exports.${this.exportName}`;
	}

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.declarator.includeDeclaration();
		this.duplicates.forEach( duplicate => duplicate.includeDeclaration() );
		return true;
	}

	toString () {
		return this.name;
	}
}

export default class VariableDeclarator extends Node {
	assignExpression () {
		for ( const proxy of this.proxies.values() ) {
			proxy.assignExpression( UNKNOWN_ASSIGNMENT );
		}
	}

	hasEffects ( options ) {
		return super.hasEffects( options )
			|| extractNames( this.id ).some( name => this.proxies.get( name ).included );
	}

	initialiseNode () {
		this.proxies = new Map();
		const lexicalBoundary = this.scope.findLexicalBoundary();
		const init = this.init
			? ( this.id.type === 'Identifier' ? this.init : UNKNOWN_ASSIGNMENT )
			: null;

		extractNames( this.id ).forEach( name => {
			const proxy = new DeclaratorProxy( name, this, lexicalBoundary.isModuleScope, init );

			this.proxies.set( name, proxy );
			this.scope.addDeclaration( name, proxy, this.parent.kind === 'var' );
		} );
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
		} );

		super.render( code, es );
	}
}
