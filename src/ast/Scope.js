export default class Scope {
	constructor ( options ) {
		options = options || {};

		this.parent = options.parent;
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
		if ( ~this.names.indexOf( name ) ) {
			return true;
		}

		if ( this.parent ) {
			return this.parent.contains( name );
		}

		return false;
	}
}