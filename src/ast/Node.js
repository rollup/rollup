import { locate } from 'locate-character';
import { UNKNOWN_VALUE, UNKNOWN_ASSIGNMENT } from './values.js';

export default class Node {
	assignExpression () {}

	bind () {
		this.eachChild( child => child.bind() );
	}

	eachChild ( callback ) {
		this.keys.forEach( key => {
			const value = this[ key ];
			if ( !value ) return;

			if ( Array.isArray( value ) ) {
				value.forEach( child => child && callback( child ) );
			} else {
				callback( value );
			}
		} );
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN_ASSIGNMENT );
	}

	getValue () {
		return UNKNOWN_VALUE;
	}

	hasEffects ( options ) {
		return this.included || this.someChild( child => child.hasEffects( options ) );
	}

	hasEffectsAsExpressionStatement () {
		return true;
	}

	hasEffectsWhenAssigned () {
		return true;
	}

	hasEffectsWhenMutated () {
		return true;
	}

	includeDeclaration () {
		return this.includeInBundle();
	}

	includeInBundle () {
		if ( this.isFullyIncluded() ) return false;
		let addedNewNodes = false;
		this.eachChild( childNode => {
			if ( childNode.includeInBundle() ) {
				addedNewNodes = true;
			}
		} );
		if ( this.included && !addedNewNodes ) {
			return false;
		}
		this.included = true;
		return true;
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

	isFullyIncluded () {
		if ( this._fullyIncluded ) {
			return true;
		}
		this._fullyIncluded = this.included && !this.someChild( child => !child.isFullyIncluded() );
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

	shouldBeIncluded () {
		return this.hasEffects( {} );
	}

	someChild ( callback ) {
		return this.keys.some( key => {
			const value = this[ key ];
			if ( !value ) return false;

			if ( Array.isArray( value ) ) {
				return value.some( child => child && callback( child ) );
			}
			return callback( value );
		} );
	}

	toString () {
		return this.module.code.slice( this.start, this.end );
	}
}
