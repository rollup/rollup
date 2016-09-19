import Node from '../Node.js';

const functionOrClassDeclaration = /^(?:Function|Class)Declaration/;

export default class ExportDefaultDeclaration extends Node {
	initialise ( scope ) {
		this.isExportDeclaration = true;
		this.isDefault = true;

		this.name = ( this.declaration.id && this.declaration.id.name ) || this.declaration.name || this.module.basename();
		scope.declarations.default = this;

		this.declaration.initialise( scope );
	}

	activate () {
		if ( this.activated ) return;
		this.activated = true;

		this.run();
	}

	addReference ( reference ) {
		this.name = reference.name;
		if ( this.original ) this.original.addReference( reference );
	}

	bind ( scope ) {
		const name = ( this.declaration.id && this.declaration.id.name ) || this.declaration.name;
		if ( name ) this.original = scope.findDeclaration( name );

		this.declaration.bind( scope );
	}

	gatherPossibleValues ( values ) {
		this.declaration.gatherPossibleValues( values );
	}

	getName ( es ) {
		if ( this.original && !this.original.isReassigned ) {
			return this.original.getName( es );
		}

		return this.name;
	}

	// TODO this is total chaos, tidy it up
	render ( code, es ) {
		const treeshake = this.module.bundle.treeshake;
		const name = this.getName( es );

		if ( this.shouldInclude || this.declaration.activated ) {
			if ( this.activated ) {
				if ( functionOrClassDeclaration.test( this.declaration.type ) ) {
					if ( this.declaration.id ) {
						code.remove( this.start, this.declaration.start );
					} else {
						throw new Error( 'TODO anonymous class/function declaration' );
					}
				}

				else {
					if ( this.original && this.original.getName( es ) === name ) {
						// prevent `var foo = foo`
						code.remove( this.leadingCommentStart || this.start, this.next || this.end );
						return; // don't render children. TODO this seems like a bit of a hack
					} else {
						code.overwrite( this.start, this.declaration.start, `${this.module.bundle.varOrConst} ${name} = ` );
					}
				}
			} else {
				// remove `var foo` from `var foo = bar()`, if `foo` is unused
				code.remove( this.start, this.declaration.start );
			}

			super.render( code, es );
		} else {
			if ( treeshake ) {
				if ( functionOrClassDeclaration.test( this.declaration.type ) && !this.declaration.activated ) {
					code.remove( this.leadingCommentStart || this.start, this.next || this.end );
				} else {
					const hasEffects = this.declaration.hasEffects( this.module.scope );
					code.remove( this.start, hasEffects ? this.declaration.start : this.next || this.end );
				}
			} else {
				code.overwrite( this.start, this.declaration.start, `${this.module.bundle.varOrConst} ${name} = ` );
			}
			// code.remove( this.start, this.next || this.end );
		}
	}

	run ( scope ) {
		this.shouldInclude = true;
		super.run( scope );
	}
}
