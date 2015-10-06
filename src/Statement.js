import { walk } from 'estree-walker';
import Scope from './ast/Scope';
import attachScopes from './ast/attachScopes';
import getLocation from './utils/getLocation';

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
		let { module, references, scope, stringLiteralRanges } = this;
		let readDepth = 0;

		walk( this.node, {
			enter ( node, parent ) {
				if ( node.type === 'TemplateElement' ) stringLiteralRanges.push([ node.start, node.end ]);
				if ( node.type === 'Literal' && typeof node.value === 'string' && /\n/.test( node.raw ) ) {
					stringLiteralRanges.push([ node.start + 1, node.end - 1 ]);
				}

				if ( node._scope ) scope = node._scope;
				if ( /Function/.test( node.type ) && !isIife( node, parent ) ) readDepth += 1;

				// special case – shorthand properties. because node.key === node.value,
				// we can't differentiate once we've descended into the node
				if ( node.type === 'Property' && node.shorthand ) {
					const reference = new Reference( node.key, scope );
					reference.isShorthandProperty = true; // TODO feels a bit kludgy
					references.push( reference );
					return this.skip();
				}

				let isReassignment;

				if ( parent && parent.type in modifierNodes ) {
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

					const reference = new Reference( node, referenceScope );
					references.push( reference );

					reference.isImmediatelyUsed = !readDepth;
					reference.isReassignment = isReassignment;

					this.skip(); // don't descend from `foo.bar.baz` into `foo.bar`
				}
			},
			leave ( node, parent ) {
				if ( node._scope ) scope = scope.parent;
				if ( /Function/.test( node.type ) && !isIife( node, parent ) ) readDepth -= 1;
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

		const statement = this;
		let hasSideEffect = false;

		walk( this.node, {
			enter ( node, parent ) {
				if ( /Function/.test( node.type ) && !isIife( node, parent ) ) return this.skip();

				// If this is a top-level call expression, or an assignment to a global,
				// this statement will need to be marked
				if ( node.type === 'CallExpression' || node.type === 'NewExpression' ) {
					hasSideEffect = true;
				}

				else if ( node.type in modifierNodes ) {
					let subject = node[ modifierNodes[ node.type ] ];
					while ( subject.type === 'MemberExpression' ) subject = subject.object;

					const declaration = statement.module.trace( subject.name );

					if ( !declaration || declaration.isExternal || declaration.statement.isIncluded ) {
						hasSideEffect = true;
					}
				}

				if ( hasSideEffect ) this.skip();
			}
		});

		if ( hasSideEffect ) statement.mark();
		return hasSideEffect;
	}

	source () {
		return this.module.source.slice( this.start, this.end );
	}

	toString () {
		return this.module.magicString.slice( this.start, this.end );
	}
}
