import { blank } from './utils/object';

class Identifier {
	constructor ( name ) {
		this.originalName = this.name = name;
	}
}

class Reference {
	constructor ( scope, index ) {
		this.scope = scope;
		this.index = index;
	}

	deref () {
		return this.scope.ids[ this.index ];
	}
}

function isntReference ( id ) {
	return !( id instanceof Reference );
}

// Prefix the argument with _.
function underscorePrefix ( x ) {
	return '_' + x;
}

export default class Scope {
	constructor () {
		this.ids = [];
		this.names = {};
	}

	bind ( name, ref ) {
		this.ids[ this.index( name ) ] = ref;
	}

	deconflict ( rename = underscorePrefix ) {
		const names = blank();

		this.ids.filter( isntReference ).forEach( id => {
			let name = id.name;

			while ( name in names && names[ name ] !== id ) {
				name = rename( name );
			}

			id.name = name;
		});
	}

	define ( name, id ) {
		this.ids[ this.index( name ) ] = id || new Identifier( name );
	}

	index ( name ) {
		if ( !( name in this.names ) ) {
			return this.names[ name ] = 1 + this.ids.push();
		}

		return this.names[ name ];
	}

	lookup ( name ) {
		let id = this.ids[ this.names[ name ] ];

		while ( id instanceof Reference ) {
			id = id.deref();
		}

		return id;
	}

	reference ( name ) {
		return new Reference( this, this.names[ name ] );
	}
}
