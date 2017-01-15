import { locate } from 'locate-character';
import { unknown } from './values.js';

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
		values.add( unknown );
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
		const location = locate( this.module.code, this.start, { offsetLine: 1 });
		location.file = this.module.id;
		location.toString = () => JSON.stringify( location );

		return location;
	}

	mark () {
		if ( this.isMarked ) return;
		this.isMarked = true;

		if ( this.parent.mark ) this.parent.mark();
	}

	markChildren () {
		function visit ( node ) {
			node.mark();

			if ( node.type === 'BlockStatement' ) return;
			node.eachChild( visit );
		}

		visit( this );
	}

	render ( code, es ) {
		this.eachChild( child => child.render( code, es ) );
	}

	run () {
		this.eachChild( child => {
			child.run();
		});

		return this;
	}

	toString () {
		return this.module.code.slice( this.start, this.end );
	}
}
