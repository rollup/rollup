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

		this.varDeclarations = [];

		if ( options.params ) {
			options.params.forEach( param => {
				this.declarations[ param.name ] = param;
			});
		}
	}

	addDeclaration ( name, declaration, isVar ) {
		const isBlockDeclaration = declaration.type === 'VariableDeclaration' && blockDeclarations[ declaration.kind ];

		if ( !isBlockDeclaration && this.isBlockScope ) {
			// it's a `var` or function declaration, and this
			// is a block scope, so we need to go up
			this.parent.addDeclaration( name, declaration, isVar );
		} else {
			this.declarations[ name ] = declaration;
			if ( isVar ) this.varDeclarations.push( name );
		}
	}

	contains ( name ) {
		return !!this.getDeclaration( name );
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

	getDeclaration ( name ) {
		return this.declarations[ name ] ||
		       this.parent && this.parent.getDeclaration( name );
	}
}
