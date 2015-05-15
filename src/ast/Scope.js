export default class Scope {
	constructor ( options ) {
		options = options || {};

		this.parent = options.parent;
		this.depth = this.parent ? this.parent.depth + 1 : 0;
		this.names = options.params || [];
		this.isBlockScope = !!options.block;
	}

	add ( name, isBlockDeclaration ) {
		if ( !isBlockDeclaration && this.isBlockScope ) {
			// it's a `var` or function declaration, and this
			// is a block scope, so we need to go up
			this.parent.add( name, isBlockDeclaration );
		} else {
			this.names.push( name );
		}
	}

	contains ( name ) {
		return !!this.findDefiningScope( name );
	}

	findDefiningScope ( name ) {
		if ( ~this.names.indexOf( name ) ) {
			return this;
		}

		if ( this.parent ) {
			return this.parent.findDefiningScope( name );
		}

		return null;
	}
}