import { blank } from '../utils/object';

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

export default class Scope {
	constructor ( options ) {
		options = options || {};

		this.parent = options.parent;
		this.depth = this.parent ? this.parent.depth + 1 : 0;
		this.declarations = blank();
		this.isBlockScope = !!options.block;

		this.varDeclarations = [];

		if ( options.params ) {
			options.params.forEach( param => {
				extractNames( param ).forEach( name => {
					this.declarations[ name ] = true;
				});
			});
		}
	}

	addDeclaration ( declaration, isBlockDeclaration, isVar ) {
		if ( !isBlockDeclaration && this.isBlockScope ) {
			// it's a `var` or function node, and this
			// is a block scope, so we need to go up
			this.parent.addDeclaration( declaration, isBlockDeclaration, isVar );
		} else {
			extractNames( declaration.id ).forEach( name => {
				this.declarations[ name ] = true;
				if ( isVar ) this.varDeclarations.push( name );
			});
		}
	}

	contains ( name ) {
		return this.declarations[ name ] ||
		       ( this.parent ? this.parent.contains( name ) : false );
	}

	findDefiningScope ( name ) {
		if ( this.declarations[ name ] ) {
			return this;
		}

		if ( this.parent ) {
			return this.parent.findDefiningScope( name );
		}

		return null;
	}
}
