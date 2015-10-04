import { blank, keys } from '../utils/object';

const extractors = {
	Identifier ( names, param ) {
		names.push( param.name );
	},

	ObjectPattern ( names, param ) {
		param.properties.forEach( prop => {
			extractors[ prop.key.type ]( names, prop.key );
		});
	},

	ArrayPattern ( names, param ) {
		param.elements.forEach( element => {
			if ( element ) extractors[ element.type ]( names, element );
		});
	},

	RestElement ( names, param ) {
		extractors[ param.argument.type ]( names, param.argument );
	},

	AssignmentPattern ( names, param ) {
		return extractors[ param.left.type ]( names, param.left );
	}
};

function extractNames ( param ) {
	let names = [];

	extractors[ param.type ]( names, param );
	return names;
}

class Declaration {
	constructor () {
		this.statement = null;
		this.name = null;

		this.isReassigned = false;
		this.aliases = [];
	}

	addAlias ( declaration ) {
		this.aliases.push( declaration );
	}

	addReference ( reference ) {
		reference.declaration = this;
		this.name = reference.name; // TODO handle differences of opinion

		if ( reference.isReassignment ) this.isReassigned = true;
	}

	render ( es6 ) {
		if ( es6 ) return this.name;
		if ( !this.isReassigned || !this.isExported ) return this.name;

		return `exports.${this.name}`;
	}

	use () {
		this.isUsed = true;
		if ( this.statement ) this.statement.mark();

		this.aliases.forEach( alias => alias.use() );
	}
}

export default class Scope {
	constructor ( options ) {
		options = options || {};

		this.parent = options.parent;
		this.isBlockScope = !!options.block;

		this.declarations = blank();

		if ( options.params ) {
			options.params.forEach( param => {
				extractNames( param ).forEach( name => {
					this.declarations[ name ] = new Declaration( name );
				});
			});
		}
	}

	addDeclaration ( node, isBlockDeclaration, isVar ) {
		if ( !isBlockDeclaration && this.isBlockScope ) {
			// it's a `var` or function node, and this
			// is a block scope, so we need to go up
			this.parent.addDeclaration( node, isBlockDeclaration, isVar );
		} else {
			extractNames( node.id ).forEach( name => {
				this.declarations[ name ] = new Declaration( name );
			});
		}
	}

	contains ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	}

	eachDeclaration ( fn ) {
		keys( this.declarations ).forEach( key => {
			fn( key, this.declarations[ key ] );
		});
	}

	findDeclaration ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent && this.parent.findDeclaration( name ) );
	}
}
