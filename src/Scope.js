import { blank, keys } from './utils/object';

// A minimal `Identifier` implementation. Anything that has an `originalName`,
// and a mutable `name` property can be used as an `Identifier`.
function Identifier ( name ) {
	this.originalName = this.name = name;
}

// A reference to an `Identifier`.
function Reference ( scope, index ) {
	this.scope = scope;
	this.index = index;
}

// Dereferences a `Reference`.
function dereference ( ref ) {
	return ref.scope.ids[ ref.index ];
}

function isntReference ( id ) {
	return !( id instanceof Reference );
}

// Prefix the argument with '_'.
function underscorePrefix ( x ) {
	return '_' + x;
}

// A Scope is a mapping from name to identifiers.
export default class Scope {
	constructor () {
		this.ids = [];
		this.names = blank();

		this.used = blank();
	}

	// Binds the `name` to the given reference `ref`.
	bind ( name, ref ) {
		if ( isntReference( ref ) ) {
			throw new TypeError( `` );
		}

		this.ids[ this.index( name ) ] = ref;
	}

	// Deconflict all names within the scope,
	// using the given renaming function.
	// If no function is supplied, the name is simply prefixed with '_'.
	deconflict ( rename = underscorePrefix ) {
		const names = this.used;

		this.ids.filter( isntReference ).forEach( id => {
			let name = id.name;

			while ( name in names && names[ name ] !== id ) {
				name = rename( name );
			}
			names[ name ] = id;

			id.name = name;
		});
	}

	// Defines `name` in the scope. `name` must be a `string` or an `Identifier`.
	define ( name ) {
		if ( typeof name === 'string' ) {
			this.ids[ this.index( name ) ] = new Identifier( name );
		} else {
			this.ids[ this.index( name.name ) ] = name;
		}
	}

	// !! private, don't use !!
	//
	// Lookup the `ids` index of `name`.
	index ( name ) {
		if ( !( name in this.names ) ) {
			// The `undefined` value of this push is a placeholder
			// that should be overwritten by the caller.
			return this.names[ name ] = this.ids.push();
		}

		return this.names[ name ];
	}

	// Lookup the identifier referred to by `name`.
	lookup ( name ) {
		let id = this.ids[ this.names[ name ] ];

		while ( id instanceof Reference ) {
			id = dereference( id );
		}

		return id;
	}

	// Get a reference to the identifier `name` in this scope.
	reference ( name ) {
		return new Reference( this, this.names[ name ] );
	}

	// Return the names currently in use in the scope.
	// Names aren't considered used until they're deconflicted.
	usedNames () {
		return keys( this.used ).sort();
	}

	// Create and return a virtual scope, bound to
	// the actual scope of this Scope.
	virtual () {
		const scope = new Scope();
		scope.ids = this.ids;
		return scope;
	}
}
