import { blank, keys } from './utils/object';

// A minimal `Identifier` implementation. Anything that has an `originalName`,
// and a mutable `name` property can be used as an `Identifier`.
class Identifier {
	constructor ( name ) {
		this.originalName = this.name = name;
	}

	mark () {
		// noop
	}
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

// ## Scope
// A Scope is a mapping from string names to `Identifiers`.
export default class Scope {
	constructor ( parent ) {
		this.ids = [];
		this.names = blank();

		this.parent = parent || null;
		this.used = blank();
	}

	// Binds the `name` to the given reference `ref`.
	bind ( name, ref ) {
		this.ids[ this.index( name ) ] = ref;
	}

	// Deconflict all names within the scope,
	// using the given renaming function.
	// If no function is supplied, `underscorePrefix` is used.
	deconflict ( rename = underscorePrefix ) {
		const names = this.used;

		this.ids.filter( ref => ref instanceof Reference ).forEach( ref => {
			// Same scope.
			if ( ref.scope.ids === this.ids ) return;

			// Another scope!
			while ( ref instanceof Reference ) {
				ref = dereference( ref );
			}

			names[ ref.name ] = ref;
		});

		this.ids.filter( isntReference ).forEach( id => {
			if ( typeof id === 'string' ) {
				throw new Error( `Required name "${id}" is undefined!` );
			}

			let name = id.name;

			while ( name in names && names[ name ] !== id ) {
				name = rename( name );
			}
			names[ name ] = id;

			id.name = name;
		});
	}

	// Defines `name` in the scope to be `id`.
	// If no `id` is supplied, a plain `Identifier` is created.
	define ( name, id ) {
		this.ids[ this.index( name ) ] = id || new Identifier( name );
	}

	// TODO: rename! Too similar to `define`.
	defines ( name ) {
		return name in this.names;
	}

	// Return the names referenced to in the scope.
	getNames () {
		return keys( this.names );
	}

	// *private, don't use*
	//
	// Return `name`'s index in the `ids` array if it exists,
	// otherwise returns the index to a new placeholder slot.
	index ( name ) {
		if ( !( name in this.names ) ) {
			return this.names[ name ] = this.ids.push( name ) - 1;
		}

		return this.names[ name ];
	}

	// Returns true if `name` is in Scope.
	inScope ( name ) {
		if ( name in this.names ) return true;

		return this.parent ? this.parent.inScope( name ) : false;
	}

	// Returns a list of `[ name, identifier ]` tuples.
	getIds () {
		return keys( this.names ).map( name => this.lookup( name ) );
	}

	// Lookup the identifier referred to by `name`.
	lookup ( name ) {
		if ( !( name in this.names ) && this.parent ) {
			return this.parent.lookup( name );
		}

		let id = this.ids[ this.names[ name ] ];

		while ( id instanceof Reference ) {
			id = dereference( id );
		}

		return id;
	}

	// Get a reference to the identifier `name` in this scope.
	reference ( name ) {
		return new Reference( this, this.index( name ) );
	}

	// Return the used names of the scope.
	// Names aren't considered used unless they're deconflicted.
	usedNames () {
		return keys( this.used ).sort();
	}

	// Create and return a virtual `Scope` instance, bound to
	// the actual scope of `this`, optionally inherit the parent scope.
	virtual ( inheritParent ) {
		const scope = new Scope( inheritParent ? this.parent : null );
		scope.ids = this.ids;
		return scope;
	}
}
