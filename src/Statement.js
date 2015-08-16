import { blank, keys } from './utils/object';
import { sequence } from './utils/promise';
import getLocation from './utils/getLocation';
import walk from './ast/walk';
import Scope from './ast/Scope';

function isIife ( node, parent ) {
	return parent && parent.type === 'CallExpression' && node === parent.callee;
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

		this.isIncluded = false;

		this.isImportDeclaration = node.type === 'ImportDeclaration';
		this.isExportDeclaration = /^Export/.test( node.type );
	}

	analyse () {
		if ( this.isImportDeclaration ) return; // nothing to analyse

		let scope = this.scope;

		walk( this.node, {
			enter ( node, parent ) {
				let newScope;

				switch ( node.type ) {
					case 'FunctionExpression':
					case 'FunctionDeclaration':
					case 'ArrowFunctionExpression':
						if ( node.type === 'FunctionDeclaration' ) {
							scope.addDeclaration( node.id.name, node );
						}

						newScope = new Scope({
							parent: scope,
							params: node.params, // TODO rest params?
							block: false
						});

						// named function expressions - the name is considered
						// part of the function's scope
						if ( node.type === 'FunctionExpression' && node.id ) {
							newScope.addDeclaration( node.id.name, node );
						}

						break;

					case 'BlockStatement':
						if ( !/Function/.test( parent.type ) ) {
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
							scope.addDeclaration( declarator.id.name, node );
						});
						break;

					case 'ClassDeclaration':
						scope.addDeclaration( node.id.name, node );
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
		let depth = 0;

		if ( !this.isImportDeclaration ) {
			walk( this.node, {
				enter: ( node, parent ) => {
					if ( node._scope ) {
						if ( !scope.isBlockScope && !isIife( node, parent ) ) depth += 1;
						scope = node._scope;
					}

					this.checkForReads( scope, node, parent, !depth );
					this.checkForWrites( scope, node );
				},
				leave: ( node, parent ) => {
					if ( node._scope ) {
						if ( !scope.isBlockScope && !isIife( node, parent ) ) depth -= 1;
						scope = scope.parent;
					}
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

			const definingScope = scope.findDefiningScope( node.name );

			if ( ( !definingScope || definingScope.depth === 0 ) && !this.defines[ node.name ] ) {
				this.dependsOn[ node.name ] = true;
				if ( strong ) this.stronglyDependsOn[ node.name ] = true;
			}
		}
	}

	checkForWrites ( scope, node ) {
		const addNode = ( node, isAssignment ) => {
			let depth = 0; // determine whether we're illegally modifying a binding or namespace

			while ( node.type === 'MemberExpression' ) {
				node = node.object;
				depth += 1;
			}

			// disallow assignments/updates to imported bindings and namespaces
			if ( isAssignment ) {
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
				if ( this.module.exports.default && depth === 0 && this.module.exports.default.identifier === node.name ) {
					// but only if this is a) inside a function body or
					// b) after the export declaration
					if ( !!scope.parent || node.start > this.module.exports.default.statement.node.start ) {
						this.module.exports.default.isModified = true;
					}
				}
			}

			if ( node.type === 'Identifier' ) {
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

		const dependencies = Object.keys( this.dependsOn );

		return sequence( dependencies, name => {
			if ( this.defines[ name ] ) return; // TODO maybe exclude from `this.dependsOn` in the first place?
			return this.module.mark( name );
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
					magicString.overwrite( node.start, node.end, 'undefined' );
				}

				// special case - variable declarations that need to be rewritten
				// as bundle exports
				if ( topLevel ) {
					if ( node.type === 'VariableDeclaration' ) {
						// if this contains a single declarator, and it's one that
						// needs to be rewritten, we replace the whole lot
						const name = node.declarations[0].id.name;
						if ( node.declarations.length === 1 && bundleExports[ name ] ) {
							magicString.overwrite( node.start, node.declarations[0].id.end, bundleExports[ name ] );
							node.declarations[0].id._skip = true;
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

					// special case = function foo ( foo ) {...}
					if ( node.id && names[ node.id.name ] && scope.declarations[ node.id.name ] ) {
						magicString.overwrite( node.id.start, node.id.end, names[ node.id.name ] );
					}

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
				// TODO others...?

				// all other identifiers should be overwritten
				magicString.overwrite( node.start, node.end, name );
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

	toString () {
		return this.module.magicString.slice( this.start, this.end );
	}
}
