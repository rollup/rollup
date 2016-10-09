import { UNKNOWN } from './values.js';
import getLocation from '../utils/getLocation.js';

export default class Node {
	bind ( scope ) {
		this.eachChild( child => child.bind( this.scope || scope ) );
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

	// TODO abolish findScope. if a node needs to store scope, store it
	findScope ( functionScope ) {
		return this.parent.findScope( functionScope );
	}

	gatherPossibleValues ( values ) {
		//this.eachChild( child => child.gatherPossibleValues( values ) );
		values.add( UNKNOWN );
	}

	getValue () {
		return UNKNOWN;
	}

	hasEffects ( scope ) {
		if ( this.scope ) scope = this.scope;

		for ( const key of this.keys ) {
			const value = this[ key ];

			if ( value ) {
				if ( 'length' in value ) {
					for ( const child of value ) {
						if ( child && child.hasEffects( scope ) ) {
							return true;
						}
					}
				} else if ( value && value.hasEffects( scope ) ) {
					return true;
				}
			}
		}
	}

	initialise ( scope ) {
		this.eachChild( child => child.initialise( this.scope || scope ) );
	}

	insertSemicolon ( code ) {
		if ( code.original[ this.end - 1 ] !== ';' ) {
			code.insertLeft( this.end, ';' );
		}
	}

	locate () {
		// useful for debugging
		const location = getLocation( this.module.code, this.start );
		location.file = this.module.id;
		location.toString = () => JSON.stringify( location );

		return location;
	}

	render ( code, es ) {
		this.eachChild( child => child.render( code, es ) );
	}

	run ( scope ) {
		if ( this.ran ) return;
		this.ran = true;

		this.eachChild( child => {
			child.run( this.scope || scope );
		});
	}

	toString () {
		return this.module.code.slice( this.start, this.end );
	}
}
