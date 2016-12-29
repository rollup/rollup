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

		// paren workaround: find first non-whitespace character position after `export default`
		let declaration_start;
		if ( this.declaration ) {
			const statementStr = code.original.slice( this.start, this.end );
			declaration_start = this.start + statementStr.match(/^\s*export\s+default\s+/)[0].length;
		}

		if ( this.shouldInclude || this.declaration.activated ) {
			if ( this.declaration.type === 'CallExpression' && this.declaration.callee.type === 'FunctionExpression' && this.declaration.arguments.length ) {
				// we're exporting an IIFE. Check it doesn't look unintentional (#1011)
				const isWrapped = /\(/.test( code.original.slice( this.start, this.declaration.start ) );

				if ( !isWrapped ) {
					code.insertRight( this.declaration.callee.start, '(' );
					code.insertLeft( this.declaration.callee.end, ')' );

					const start = this.declaration.callee.end;
					let end = this.declaration.arguments[0].start - 1;
					while ( code.original[ end ] !== '(' ) end -= 1;

					const newlineSeparated = /\n/.test( code.original.slice( start, end ) );

					if ( newlineSeparated ) {
						this.module.warn({
							code: 'AMBIGUOUS_DEFAULT_EXPORT',
							message: `Ambiguous default export (is a call expression, but looks like a function declaration)`,
							url: 'https://github.com/rollup/rollup/wiki/Troubleshooting#ambiguous-default-export'
						}, this.declaration.start );
					}
				}
			}

			if ( this.activated ) {
				if ( functionOrClassDeclaration.test( this.declaration.type ) ) {
					if ( this.declaration.id ) {
						code.remove( this.start, declaration_start );
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
					const hasEffects = this.declaration.hasEffects( this.module.scope );
					code.remove( this.start, hasEffects ? declaration_start : this.next || this.end );
				}
			} else {
				code.overwrite( this.start, declaration_start, `${this.module.bundle.varOrConst} ${name} = ` );
			}
			// code.remove( this.start, this.next || this.end );
		}
	}

	run ( scope ) {
		this.shouldInclude = true;
		super.run( scope );
	}
}
