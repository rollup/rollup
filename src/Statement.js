import { walk } from 'estree-walker';
import Scope from './ast/Scope';
import attachScopes from './ast/attachScopes';

const modifierNodes = {
	AssignmentExpression: 'left',
	UpdateExpression: 'argument'
};

function isIife ( node, parent ) {
	return parent && parent.type === 'CallExpression' && node === parent.callee;
}

function isReference ( node, parent ) {
	if ( node.type === 'MemberExpression' ) {
		return !node.computed && isReference( node.object, node );
	}

	if ( node.type === 'Identifier' ) {
		// disregard the `bar` in { bar: foo }
		if ( parent.type === 'Property' && node !== parent.value ) return false;

		// disregard the `bar` in `class Foo { bar () {...} }`
		if ( parent.type === 'MethodDefinition' ) return false;

		// disregard the `bar` in `export { foo as bar }`
		if ( parent.type === 'ExportSpecifier' && node !== parent.local ) return;

		return true;
	}
}

class Reference {
	constructor ( node, scope ) {
		this.node = node;
		this.scope = scope;

		this.declaration = null; // bound later

		this.parts = [];

		let root = node;
		while ( root.type === 'MemberExpression' ) {
			this.parts.unshift( root.property.name );
			root = root.object;
		}

		this.parts.unshift( root.name );
		this.name = root.name;
	}
}

export default class Statement {
	constructor ( node, module, start, end ) {
		this.node = node;
		this.module = module;
		this.start = start;
		this.end = end;
		this.next = null; // filled in later

		this.scope = new Scope();

		this.references = [];

		this.isIncluded = false;

		this.isImportDeclaration = node.type === 'ImportDeclaration';
		this.isExportDeclaration = /^Export/.test( node.type );
		this.isReexportDeclaration = this.isExportDeclaration && !!node.source;
	}

	analyse () {
		if ( this.isImportDeclaration ) return; // nothing to analyse

		// attach scopes
		attachScopes( this );

		// attach statement to each top-level declaration,
		// so we can mark statements easily
		this.scope.eachDeclaration( ( name, declaration ) => {
			declaration.statement = this;
		});

		// find references
		let { references, scope } = this;

		walk( this.node, {
			enter ( node, parent ) {
				if ( node._scope ) scope = node._scope;

				if ( isReference( node, parent ) ) {
					const reference = new Reference( node, scope );
					references.push( reference );

					if ( node.type === 'Identifier' ) {
						// `foo = bar`
						if ( parent.type === 'AssignmentExpression' && node === parent.left ) {
							reference.isReassignment = true;
						}

						// `foo++`
						if ( parent.type === 'UpdateExpression' && node === parent.argument ) {
							reference.isReassignment = true;
						}
					}

					this.skip(); // don't descend from `foo.bar.baz` into `foo.bar`
				}
			},
			leave: ( node ) => {
				if ( node._scope ) scope = scope.parent;
			}
		});
	}

	mark () {
		if ( this.isIncluded ) return; // prevent infinite loops
		this.isIncluded = true;

		this.references.forEach( reference => {
			if ( reference.declaration && reference.declaration.statement ) {
				reference.declaration.statement.mark();
			}
		});
	}

	markSideEffect () {
		const statement = this;

		walk( this.node, {
			enter ( node, parent ) {
				if ( /Function/.test( node.type ) && !isIife( node, parent ) ) return this.skip();

				// If this is a top-level call expression, or an assignment to a global,
				// this statement will need to be marked
				if ( node.type === 'CallExpression' || node.type === 'NewExpression' ) {
					statement.mark();
				}

				else if ( node.type in modifierNodes ) {
					let subject = node[ modifierNodes[ node.type ] ];
					while ( subject.type === 'MemberExpression' ) subject = subject.object;

					const declaration = statement.module.trace( subject.name );

					// global
					if ( !declaration ) statement.mark();
				}
			}
		});
	}

	source () {
		return this.module.source.slice( this.start, this.end );
	}

	toString () {
		return this.module.magicString.slice( this.start, this.end );
	}
}
