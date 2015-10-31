import { walk } from 'estree-walker';
import Scope from './ast/Scope.js';
import attachScopes from './ast/attachScopes.js';
import modifierNodes from './ast/modifierNodes.js';
import getLocation from './utils/getLocation.js';
import testForSideEffects from './utils/testForSideEffects.js';

function isReference ( node, parent ) {
	if ( node.type === 'MemberExpression' ) {
		return !node.computed && isReference( node.object, node );
	}

	if ( node.type === 'Identifier' ) {
		// TODO is this right?
		if ( parent.type === 'MemberExpression' ) return parent.computed || node === parent.object;

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
	constructor ( node, scope, statement ) {
		this.node = node;
		this.scope = scope;
		this.statement = statement;

		this.declaration = null; // bound later

		this.parts = [];

		let root = node;
		while ( root.type === 'MemberExpression' ) {
			this.parts.unshift( root.property.name );
			root = root.object;
		}

		this.name = root.name;

		this.start = node.start;
		this.end = node.start + this.name.length; // can be overridden in the case of namespace members
		this.rewritten = false;
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
		this.stringLiteralRanges = [];

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
		const statement = this;
		let { module, references, scope, stringLiteralRanges } = this;
		let readDepth = 0;

		walk( this.node, {
			enter ( node, parent ) {
				// warn about eval
				if ( node.type === 'CallExpression' && node.callee.name === 'eval' && !scope.contains( 'eval' ) ) {
					module.bundle.onwarn( `Use of \`eval\` (in ${module.id}) is discouraged, as it may cause issues with minification. See https://github.com/rollup/rollup/wiki/Troubleshooting#avoiding-eval for more details` );
				}

				if ( node.type === 'TemplateElement' ) stringLiteralRanges.push([ node.start, node.end ]);
				if ( node.type === 'Literal' && typeof node.value === 'string' && /\n/.test( node.raw ) ) {
					stringLiteralRanges.push([ node.start + 1, node.end - 1 ]);
				}

				if ( node._scope ) scope = node._scope;
				if ( /Function/.test( node.type ) ) readDepth += 1;

				// special case – shorthand properties. because node.key === node.value,
				// we can't differentiate once we've descended into the node
				if ( node.type === 'Property' && node.shorthand ) {
					const reference = new Reference( node.key, scope );
					reference.isShorthandProperty = true; // TODO feels a bit kludgy
					references.push( reference );
					return this.skip();
				}

				const isMutation = parent && parent.type in modifierNodes;
				let isReassignment;

				if ( isMutation ) {
					let subject = parent[ modifierNodes[ parent.type ] ];
					let depth = 0;

					while ( subject.type === 'MemberExpression' ) {
						subject = subject.object;
						depth += 1;
					}

					const importDeclaration = module.imports[ subject.name ];

					if ( !scope.contains( subject.name ) && importDeclaration ) {
						const minDepth = importDeclaration.name === '*' ?
							2 : // cannot do e.g. `namespace.foo = bar`
							1;  // cannot do e.g. `foo = bar`, but `foo.bar = bar` is fine

						if ( depth < minDepth ) {
							const err = new Error( `Illegal reassignment to import '${subject.name}'` );
							err.file = module.id;
							err.loc = getLocation( module.magicString.toString(), subject.start );
							throw err;
						}
					}

					isReassignment = !depth;
				}

				if ( isReference( node, parent ) ) {
					// function declaration IDs are a special case – they're associated
					// with the parent scope
					const referenceScope = parent.type === 'FunctionDeclaration' && node === parent.id ?
						scope.parent :
						scope;

					const reference = new Reference( node, referenceScope, statement );
					references.push( reference );

					reference.isImmediatelyUsed = !readDepth;
					reference.isReassignment = isReassignment;
					reference.isMutation = !readDepth && isMutation;

					this.skip(); // don't descend from `foo.bar.baz` into `foo.bar`
				}
			},
			leave ( node ) {
				if ( node._scope ) scope = scope.parent;
				if ( /Function/.test( node.type ) ) readDepth -= 1;
			}
		});
	}

	mark () {
		if ( this.isIncluded ) return; // prevent infinite loops
		this.isIncluded = true;

		this.references.forEach( reference => {
			if ( reference.declaration ) reference.declaration.use();
		});
	}

	markSideEffect () {
		if ( this.isIncluded ) return;

		if ( testForSideEffects( this.node, this.scope, this ) ) {
			this.mark();
			return true;
		}
	}

	source () {
		return this.module.source.slice( this.start, this.end );
	}

	toString () {
		return this.module.magicString.slice( this.start, this.end );
	}
}
