import { blank } from '../utils/object';

const blockDeclarations = {
	'const': true,
	'let': true
};

export default class Scope {
	constructor ( options ) {
		options = options || {};

		this.parent = options.parent;
		this.depth = this.parent ? this.parent.depth + 1 : 0;
		this.declarations = blank();
		this.isBlockScope = !!options.block;

		if ( options.params ) {
			options.params.forEach( param => {
				this.declarations[ param.name ] = param;
			});
		}
	}

	// add ( name, isBlockDeclaration ) {
	// 	if ( !isBlockDeclaration && this.isBlockScope ) {
	// 		// it's a `var` or function declaration, and this
	// 		// is a block scope, so we need to go up
	// 		this.parent.add( name, isBlockDeclaration );
	// 	} else {
	// 		this.names.push( name );
	// 	}
	// }

	addDeclaration ( name, declaration ) {
		const isBlockDeclaration = declaration.type === 'VariableDeclaration' && blockDeclarations[ declaration.kind ];

		if ( !isBlockDeclaration && this.isBlockScope ) {
			// it's a `var` or function declaration, and this
			// is a block scope, so we need to go up
			this.parent.addDeclaration( name, declaration );
		} else {
			this.declarations[ name ] = declaration;
		}
	}

	getDeclaration ( name ) {
		return this.declarations[ name ] ||
		       this.parent && this.parent.getDeclaration( name );
	}

	contains ( name ) {
		return !!this.getDeclaration( name );
	}

	findDefiningScope ( name ) {
		if ( !!this.declarations[ name ] ) {
			return this;
		}

		if ( this.parent ) {
			return this.parent.findDefiningScope( name );
		}

		return null;
	}
}
