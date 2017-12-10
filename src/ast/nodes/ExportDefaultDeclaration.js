import Node from '../Node.js';
import ExecutionPathOptions from '../ExecutionPathOptions';

const functionOrClassDeclaration = /^(?:Function|Class)Declaration/;

export default class ExportDefaultDeclaration extends Node {
	bindNode () {
		if ( this._declarationName ) {
			this.variable.setOriginalVariable( this.scope.findVariable( this._declarationName ) );
		}
	}

	includeDefaultExport () {
		this.included = true;
		this.declaration.includeInBundle();
	}

	includeInBundle () {
		if ( this.declaration.shouldBeIncluded() ) {
			return this.declaration.includeInBundle();
		}
		return false;
	}

	initialiseNode () {
		this.isExportDeclaration = true;
		this._declarationName = (this.declaration.id && this.declaration.id.name ) || this.declaration.name;
		this.variable = this.scope.addExportDefaultDeclaration( this._declarationName || this.module.basename(), this );
	}

	// TODO this is total chaos, tidy it up
	render ( code, es ) {
		const treeshake = this.module.bundle.treeshake;
		const name = this.variable.getName( es );

		// paren workaround: find first non-whitespace character position after `export default`
		let declaration_start;
		let id_index;
		if ( this.declaration ) {
			const statementStr = code.original.slice( this.start, this.end );
			declaration_start = this.start + statementStr.match( /^\s*export\s+default\s*/ )[ 0 ].length;
			if ( !this.declaration.id && functionOrClassDeclaration.test( this.declaration.type ) ) {
				id_index = this.start + statementStr.match( /^\s*export\s+default\s*(?:function|class)/ )[ 0 ].length;
			}
		}

		if ( this.included || this.declaration.included ) {
			if ( this.included ) {
				if ( functionOrClassDeclaration.test( this.declaration.type ) ) {
					if ( !this.declaration.id ) {
						code.appendLeft(id_index, ` ${this.variable.name}`);
					}
					code.remove( this.start, declaration_start );
				}

				else {
					if ( this.variable.getOriginalVariableName( es ) === name ) {
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
