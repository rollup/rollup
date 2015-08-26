import { blank, keys } from './utils/object';
import getLocation from './utils/getLocation';
import walk from './ast/walk';
import Scope from './ast/Scope';

function isIife ( node, parent ) {
	return parent && parent.type === 'CallExpression' && node === parent.callee;
}

function isFunctionDeclaration ( node, parent ) {
	// `function foo () {}`
	if ( node.type === 'FunctionDeclaration' ) return true;

	// `var foo = function () {}` - same thing for present purposes
	if ( node.type === 'FunctionExpression' && parent.type === 'VariableDeclarator' ) return true;
}

export default class Statement {
	constructor ( node, module, start, end ) {
		this.node = node;
		this.module = module;
		this.start = start;
		this.end = end;
		this.next = null; // filled in later

		this.scope = new Scope();
		this.defines = blank();
		this.modifies = blank();
		this.dependsOn = blank();
		this.stronglyDependsOn = blank();

		this.reassigns = blank();

		this.isIncluded = false;

		this.isImportDeclaration = node.type === 'ImportDeclaration';
		this.isExportDeclaration = /^Export/.test( node.type );
		this.isReexportDeclaration = this.isExportDeclaration && !!node.source;
	}

	analyse () {
		if ( this.isImportDeclaration ) return; // nothing to analyse

		let scope = this.scope;

		walk( this.node, {
			enter ( node, parent ) {
				let newScope;

				switch ( node.type ) {
					case 'FunctionDeclaration':
						scope.addDeclaration( node.id.name, node, false );

					case 'BlockStatement':
						if ( parent && /Function/.test( parent.type ) ) {
							newScope = new Scope({
								parent: scope,
								block: false,
								params: parent.params
							});

							// named function expressions - the name is considered
							// part of the function's scope
							if ( parent.type === 'FunctionExpression' && parent.id ) {
								newScope.addDeclaration( parent.id.name, parent, false );
							}
						} else {
							newScope = new Scope({
								parent: scope,
								block: true
							});
						}

						break;

					case 'CatchClause':
						newScope = new Scope({
							parent: scope,
							params: [ node.param ],
							block: true
						});

						break;

					case 'VariableDeclaration':
						node.declarations.forEach( declarator => {
							scope.addDeclaration( declarator.id.name, node, true );
						});
						break;

					case 'ClassDeclaration':
						scope.addDeclaration( node.id.name, node, false );
						break;
				}

				if ( newScope ) {
					Object.defineProperty( node, '_scope', {
						value: newScope,
						configurable: true
					});

					scope = newScope;
				}
			},
			leave ( node ) {
				if ( node._scope ) {
					scope = scope.parent;
				}
			}
		});

		// This allows us to track whether we're looking at code that will
		// be executed immediately (either outside a function, or immediately
		// inside an IIFE), for the purposes of determining whether dependencies
		// are strong or weak. It's not bulletproof, since it wouldn't catch...
		//
		//    var calledImmediately = function () {
		//      doSomethingWith( strongDependency );
		//    }
		//    calledImmediately();
		//
		// ...but it's better than nothing
		let readDepth = 0;

		// This allows us to track whether a modifying statement (i.e. assignment
		// /update expressions) need to be captured
		let writeDepth = 0;

		if ( !this.isImportDeclaration ) {
			walk( this.node, {
				enter: ( node, parent ) => {
					if ( isFunctionDeclaration( node, parent ) ) writeDepth += 1;
					if ( /Function/.test( node.type ) && !isIife( node, parent ) ) readDepth += 1;

					if ( node._scope ) scope = node._scope;

					this.checkForReads( scope, node, parent, !readDepth );
					this.checkForWrites( scope, node, writeDepth );
				},
				leave: ( node, parent ) => {
					if ( isFunctionDeclaration( node, parent ) ) writeDepth -= 1;
					if ( /Function/.test( node.type ) && !isIife( node, parent ) ) readDepth -= 1;

					if ( node._scope ) scope = scope.parent;
				}
			});
		}

		keys( scope.declarations ).forEach( name => {
			this.defines[ name ] = true;
		});
	}

	checkForReads ( scope, node, parent, strong ) {
		if ( node.type === 'Identifier' ) {
			// disregard the `bar` in `foo.bar` - these appear as Identifier nodes
			if ( parent.type === 'MemberExpression' && !parent.computed && node !== parent.object ) {
				return;
			}

			// disregard the `bar` in { bar: foo }
			if ( parent.type === 'Property' && node !== parent.value ) {
				return;
			}

			// disregard the `bar` in `class Foo { bar () {...} }`
			if ( parent.type === 'MethodDefinition' ) return;

			// disregard the `bar` in `export { foo as bar }`
			if ( parent.type === 'ExportSpecifier' && node !== parent.local ) return;

			const definingScope = scope.findDefiningScope( node.name );

			if ( !definingScope || definingScope.depth === 0 ) {
				this.dependsOn[ node.name ] = true;
				if ( strong ) this.stronglyDependsOn[ node.name ] = true;
			}
		}
	}

	checkForWrites ( scope, node, writeDepth ) {
		const addNode = ( node, isAssignment ) => {
			let depth = 0; // determine whether we're illegally modifying a binding or namespace

			while ( node.type === 'MemberExpression' ) {
				node = node.object;
				depth += 1;
			}

			// disallow assignments/updates to imported bindings and namespaces
			if ( isAssignment ) {
				// FIXME: imports is no longer used.
				const importSpecifier = this.module.imports[ node.name ];

				if ( importSpecifier && !scope.contains( node.name ) ) {
					const minDepth = importSpecifier.name === '*' ?
						2 : // cannot do e.g. `namespace.foo = bar`
						1;  // cannot do e.g. `foo = bar`, but `foo.bar = bar` is fine

					if ( depth < minDepth ) {
						const err = new Error( `Illegal reassignment to import '${node.name}'` );
						err.file = this.module.id;
						err.loc = getLocation( this.module.magicString.toString(), node.start );
						throw err;
					}
				}

				// special case = `export default foo; foo += 1;` - we'll
				// need to assign a new variable so that the exported
				// value is not updated by the second statement
				const def = this.module.exports.lookup( 'default' );
				if ( def && depth === 0 && def.identifier === node.name ) {
					// but only if this is a) inside a function body or
					// b) after the export declaration
					if ( !!scope.parent || node.start > def.statement.node.start ) {
						def.isModified = true;
					}
				}

				// we track updates/reassignments to variables, to know whether we
				// need to rewrite it later from `foo` to `exports.foo` to keep
				// bindings live
				if (
					depth === 0 &&
					writeDepth > 0 &&
					!scope.contains( node.name )
				) {
					this.reassigns[ node.name ] = true;
				}
			}

			// we only care about writes that happen a) at the top level,
			// or b) inside a function that could be immediately invoked.
			// Writes inside named functions are only relevant if the
			// function is called, in which case we don't need to do
			// anything (but we still need to call checkForWrites to
			// catch illegal reassignments to imported bindings)
			if ( writeDepth === 0 && node.type === 'Identifier' ) {
				this.modifies[ node.name ] = true;
			}
		};

		if ( node.type === 'AssignmentExpression' ) {
			addNode( node.left, true );
		}

		else if ( node.type === 'UpdateExpression' ) {
			addNode( node.argument, true );
		}

		else if ( node.type === 'CallExpression' ) {
			node.arguments.forEach( arg => addNode( arg, false ) );

			// `foo.bar()` is assumed to mutate foo
			if ( node.callee.type === 'MemberExpression' ) {
				addNode( node.callee );
			}
		}
	}

	mark () {
		if ( this.isIncluded ) return; // prevent infinite loops
		this.isIncluded = true;

		// `export { name } from './other'` is a special case
		if ( this.isReexportDeclaration ) {
			const otherModule = this.module.getModule( this.node.source.value );

			this.node.specifiers.forEach( specifier => {
				otherModule.exports.lookup( specifier.local.name ).statement.mark();
			});

			return;
		}

		Object.keys( this.dependsOn ).forEach( name => {
			if ( this.defines[ name ] ) return; // TODO maybe exclude from `this.dependsOn` in the first place?
			this.module.mark( name );
		});
	}

	replaceIdentifiers ( magicString, names, bundleExports ) {
		const replacementStack = [ names ];
		const nameList = keys( names );

		let deshadowList = [];
		nameList.forEach( name => {
			const replacement = names[ name ];
			deshadowList.push( replacement.split( '.' )[0] );
		});

		let topLevel = true;
		let depth = 0;

		walk( this.node, {
			enter ( node, parent ) {
				if ( node._skip ) return this.skip();

				if ( /^Function/.test( node.type ) ) depth += 1;

				// `this` is undefined at the top level of ES6 modules
				if ( node.type === 'ThisExpression' && depth === 0 ) {
					magicString.overwrite( node.start, node.end, 'undefined', true );
				}

				// special case - variable declarations that need to be rewritten
				// as bundle exports
				if ( topLevel ) {
					if ( node.type === 'VariableDeclaration' ) {
						// if this contains a single declarator, and it's one that
						// needs to be rewritten, we replace the whole lot
						const id = node.declarations[0].id;
						const name = id.name;

						if ( node.declarations.length === 1 && bundleExports[ name ] ) {
							magicString.overwrite( node.start, id.end, bundleExports[ name ], true );
							id._skip = true;
						}

						// otherwise, we insert the `exports.foo = foo` after the declaration
						else {
							const exportInitialisers = node.declarations
								.map( declarator => declarator.id.name )
								.filter( name => !!bundleExports[ name ] )
								.map( name => `\n${bundleExports[name]} = ${name};` )
								.join( '' );

							if ( exportInitialisers ) {
								// TODO clean this up
								try {
									magicString.insert( node.end, exportInitialisers );
								} catch ( err ) {
									magicString.append( exportInitialisers );
								}
							}
						}
					}
				}

				const scope = node._scope;

				if ( scope ) {
					topLevel = false;

					let newNames = blank();
					let hasReplacements;

					keys( names ).forEach( name => {
						if ( !scope.declarations[ name ] ) {
							newNames[ name ] = names[ name ];
							hasReplacements = true;
						}
					});

					deshadowList.forEach( name => {
						if ( scope.declarations[ name ] ) {
							newNames[ name ] = name + '$$'; // TODO better mechanism
							hasReplacements = true;
						}
					});

					if ( !hasReplacements && depth > 0 ) {
						return this.skip();
					}

					names = newNames;
					replacementStack.push( newNames );
				}

				if ( node.type !== 'Identifier' ) return;

				// if there's no replacement, or it's the same, there's nothing more to do
				const name = names[ node.name ];
				if ( !name || name === node.name ) return;

				// shorthand properties (`obj = { foo }`) need to be expanded
				if ( parent.type === 'Property' && parent.shorthand ) {
					magicString.insert( node.end, `: ${name}` );
					parent.key._skip = true;
					parent.value._skip = true; // redundant, but defensive
					return;
				}

				// property names etc can be disregarded
				if ( parent.type === 'MemberExpression' && !parent.computed && node !== parent.object ) return;
				if ( parent.type === 'Property' && node !== parent.value ) return;
				if ( parent.type === 'MethodDefinition' && node === parent.key ) return;
				if ( parent.type === 'FunctionExpression' ) return;
				if ( /Function/.test( parent.type ) && ~parent.params.indexOf( node ) ) return;
				// TODO others...?

				// all other identifiers should be overwritten
				magicString.overwrite( node.start, node.end, name, true );
			},

			leave ( node ) {
				if ( /^Function/.test( node.type ) ) depth -= 1;

				if ( node._scope ) {
					replacementStack.pop();
					names = replacementStack[ replacementStack.length - 1 ];
				}
			}
		});

		return magicString;
	}

	source () {
		return this.module.source.slice( this.start, this.end );
	}

	toString () {
		return this.module.magicString.slice( this.start, this.end );
	}
}
