import { locate } from 'locate-character';
import { UNKNOWN } from './values.js';

export default class Node {
	bind () {
		this.eachChild( child => child.bind() );
	}

	eachChild ( callback ) {
		for ( const key of this.keys ) {
			if ( this.shorthand && key === 'key' ) continue; // key and value are the same

			const value = this[ key ];

			if ( value ) {
				if ( 'length' in value ) {
					for ( const child of value ) {
						if ( child ) callback( child );
					}
				} else if ( value ) {
					callback( value );
				}
			}
		}
	}

	findParent ( selector ) {
		return selector.test( this.type ) ? this : this.parent.findParent( selector );
	}

	gatherPossibleValues ( values ) {
		//this.eachChild( child => child.gatherPossibleValues( values ) );
		values.add( UNKNOWN );
	}

	getValue () {
		return UNKNOWN;
	}

	hasEffects () {
		for ( const key of this.keys ) {
			const value = this[ key ];

			if ( value ) {
				if ( 'length' in value ) {
					for ( const child of value ) {
						if ( child && child.hasEffects( this.scope ) ) {
							return true;
						}
					}
				} else if ( value.hasEffects( this.scope ) ) {
					return true;
				}
			}
		}
	}

	initialise ( parentScope ) {
		this.initialiseScope( parentScope );
		this.initialiseNode( parentScope );
		this.initialiseChildren( parentScope );
	}

	// Override if e.g. some children need to be initialised with the parent scope
	initialiseChildren () {
		this.eachChild( child => child.initialise( this.scope ) );
	}

	// Override to perform special initialisation steps after the scope is initialised
	initialiseNode () {}

	// Overwrite to create a new scope
	initialiseScope ( parentScope ) {
		this.scope = parentScope;
	}

	insertSemicolon ( code ) {
		if ( code.original[ this.end - 1 ] !== ';' ) {
			code.appendLeft( this.end, ';' );
		}
	}

	locate () {
		// useful for debugging
		const location = locate( this.module.code, this.start, { offsetLine: 1 } );
		location.file = this.module.id;
		location.toString = () => JSON.stringify( location );

		return location;
	}

	render ( code, es ) {
		this.eachChild( child => child.render( code, es ) );
	}

	run () {
		if ( this.ran ) return;
		this.ran = true;

		this.eachChild( child => child.run() );
	}

	toString () {
		return this.module.code.slice( this.start, this.end );
	}
}
