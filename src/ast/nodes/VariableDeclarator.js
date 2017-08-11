import Node from '../Node.js';
import extractNames from '../utils/extractNames.js';
import { UNKNOWN } from '../values.js';

class DeclaratorProxy {
	constructor ( name, declarator, isTopLevel, init ) {
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

	toString () {
		return this.name;
	}
}

export default class VariableDeclarator extends Node {
	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.run();

		// if declaration is inside a block, ensure that the block
		// is marked for inclusion
		if ( this.parent.kind === 'var' ) {
			let node = this.parent.parent;
			while ( /Statement/.test( node.type ) ) {
				node.shouldInclude = true;
				node = node.parent;
			}
		}
	}

	hasEffects () {
		return this.init && this.init.hasEffects();
	}

	initialiseNode () {
		this.proxies = new Map();
		const lexicalBoundary = this.scope.findLexicalBoundary();
		const init = this.init ? ( this.id.type === 'Identifier' ? this.init : UNKNOWN ) : // TODO maybe UNKNOWN is unnecessary
			null;

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
