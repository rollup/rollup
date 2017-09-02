import Node from '../Node.js';
import ExecutionPathOptions from '../ExecutionPathOptions';

const functionOrClassDeclaration = /^(?:Function|Class)Declaration/;

export default class ExportDefaultDeclaration extends Node {
	addReference ( reference ) {
		this.name = reference.name;
		if ( this.original ) this.original.addReference( reference );
	}

	bind () {
		const name = ( this.declaration.id && this.declaration.id.name ) || this.declaration.name;
		if ( name ) this.original = this.scope.findDeclaration( name );

		this.declaration.bind();
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

	includeDeclaration () {
		if ( this.included ) {
			return false;
		}
		this.included = true;
		this.declaration.includeInBundle();
		return true;
	}

	includeInBundle () {
		if ( this.declaration.shouldBeIncluded() ) {
			return this.declaration.includeInBundle();
		}
		return false;
	}

	initialiseNode () {
		this.isExportDeclaration = true;
		this.isDefault = true;

		this.name = ( this.declaration.id && this.declaration.id.name ) || this.declaration.name || this.module.basename();
		this.scope.variables.default = this;
	}

	// TODO this is total chaos, tidy it up
	render ( code, es ) {
		const treeshake = this.module.bundle.treeshake;
		const name = this.getName( es );

		// paren workaround: find first non-whitespace character position after `export default`
		let declaration_start;
		if ( this.declaration ) {
			const statementStr = code.original.slice( this.start, this.end );
			declaration_start = this.start + statementStr.match( /^\s*export\s+default\s*/ )[ 0 ].length;
		}

		if ( this.included || this.declaration.included ) {
			if ( this.included ) {
				if ( functionOrClassDeclaration.test( this.declaration.type ) ) {
					if ( this.declaration.id ) {
						code.remove( this.start, declaration_start );
					} else {
						code.overwrite( this.start, declaration_start, `var ${this.name} = ` );
						if ( code.original[ this.end - 1 ] !== ';' ) code.appendLeft( this.end, ';' );
					}
				}

				else {
					if ( this.original && this.original.getName( es ) === name ) {
						// prevent `var foo = foo`
						code.remove( this.leadingCommentStart || this.start, this.next || this.end );
						return; // don't render children. TODO this seems like a bit of a hack
					} else {
						code.overwrite( this.start, declaration_start, `${this.module.bundle.varOrConst} ${name} = ` );
					}

					this.insertSemicolon( code );
				}
			} else {
				// remove `var foo` from `var foo = bar()`, if `foo` is unused
				code.remove( this.start, declaration_start );
			}

			super.render( code, es );
		} else {
			if ( treeshake ) {
				if ( functionOrClassDeclaration.test( this.declaration.type ) ) {
					code.remove( this.leadingCommentStart || this.start, this.next || this.end );
				} else {
					const hasEffects = this.declaration.hasEffects( ExecutionPathOptions.create() );
					code.remove( this.start, hasEffects ? declaration_start : this.next || this.end );
				}
			} else if ( name === this.declaration.name ) {
				code.remove( this.start, this.next || this.end );
			} else {
				code.overwrite( this.start, declaration_start, `${this.module.bundle.varOrConst} ${name} = ` );
			}
			// code.remove( this.start, this.next || this.end );
		}
	}
}
