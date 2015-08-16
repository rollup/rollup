import { dirname } from './utils/path';
import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import walk from './ast/walk';
import { blank, keys } from './utils/object';
import { first, sequence } from './utils/promise';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

const emptyArrayPromise = Promise.resolve([]);

function deconflict ( name, names ) {
	while ( name in names ) {
		name = `_${name}`;
	}

	return name;
}

function isEmptyExportedVarDeclaration ( node, module, allBundleExports, moduleReplacements, es6 ) {
	if ( node.type !== 'VariableDeclaration' || node.declarations[0].init ) return false;

	const name = node.declarations[0].id.name;
	const canonicalName = moduleReplacements[ name ] || name;

	return canonicalName in allBundleExports;
}

export default class Module {
	constructor ({ id, source, ast, bundle }) {
		this.source = source;

		this.bundle = bundle;
		this.id = id;

		// By default, `id` is the filename. Custom resolvers and loaders
		// can change that, but it makes sense to use it for the source filename
		this.magicString = new MagicString( source, {
			filename: id
		});

		// remove existing sourceMappingURL comments
		const pattern = /\/\/#\s+sourceMappingURL=.+\n?/g;
		let match;
		while ( match = pattern.exec( source ) ) {
			this.magicString.remove( match.index, match.index + match[0].length );
		}

		this.suggestedNames = blank();
		this.comments = [];

		this.statements = this._parse( ast );

		// imports and exports, indexed by ID
		this.imports = blank();
		this.exports = blank();

		this.exportAlls = blank();

		// array of all-export sources
		this.exportDelegates = [];

		this.canonicalNames = blank(); // TODO still necessary?
		this.replacements = blank();

		this.definitions = blank();
		this.definitionPromises = blank();
		this.modifications = blank();

		this.analyse();
	}

	addExport ( statement ) {
		const node = statement.node;
		const source = node.source && node.source.value;

		// export default function foo () {}
		// export default foo;
		// export default 42;
		if ( node.type === 'ExportDefaultDeclaration' ) {
			const isDeclaration = /Declaration$/.test( node.declaration.type );
			const isAnonymous = /(?:Class|Function)Expression$/.test( node.declaration.type );

			const identifier = isDeclaration ?
				node.declaration.id.name :
				node.declaration.type === 'Identifier' ?
					node.declaration.name :
					null;

			this.exports.default = {
				statement,
				name: 'default',
				localName: identifier || 'default',
				identifier,
				isDeclaration,
				isAnonymous,
				isModified: false // in case of `export default foo; foo = somethingElse`
			};
		}

		// export { foo, bar, baz }
		// export var foo = 42;
		// export function foo () {}
		else if ( node.type === 'ExportNamedDeclaration' ) {
			if ( node.specifiers.length ) {
				// export { foo, bar, baz }
				node.specifiers.forEach( specifier => {
					const localName = specifier.local.name;
					const exportedName = specifier.exported.name;

					// export { foo } from './foo';
					if ( source ) {
						this.imports[ localName ] = {
							source,
							localName: exportedName,
							name: localName
						};
					}

					this.exports[ exportedName ] = {
						statement,
						localName,
						exportedName,
						linkedImport: source ? this.imports[ localName ] : null
					};
				});
			}

			else {
				let declaration = node.declaration;

				let name;

				if ( declaration.type === 'VariableDeclaration' ) {
					// export var foo = 42
					name = declaration.declarations[0].id.name;
				} else {
					// export function foo () {}
					name = declaration.id.name;
				}

				this.exports[ name ] = {
					statement,
					localName: name,
					expression: declaration
				};
			}
		}

		// Store `export * from '...'` statements in an array of delegates.
		// When an unknown import is encountered, we see if one of them can satisfy it.
		else {
			this.exportDelegates.push({
				statement,
				source
			});
		}
	}

	addImport ( statement ) {
		const node = statement.node;
		const source = node.source.value;

		node.specifiers.forEach( specifier => {
			const isDefault = specifier.type === 'ImportDefaultSpecifier';
			const isNamespace = specifier.type === 'ImportNamespaceSpecifier';

			const localName = specifier.local.name;
			const name = isDefault ? 'default' : isNamespace ? '*' : specifier.imported.name;

			if ( this.imports[ localName ] ) {
				const err = new Error( `Duplicated import '${localName}'` );
				err.file = this.id;
				err.loc = getLocation( this.source, specifier.start );
				throw err;
			}

			this.imports[ localName ] = {
				source,
				name,
				localName
			};
		});
	}

	analyse () {
		// discover this module's imports and exports
		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration ) this.addImport( statement );
			else if ( statement.isExportDeclaration ) this.addExport( statement );

			statement.analyse();

			// consolidate names that are defined/modified in this module
			keys( statement.defines ).forEach( name => {
				this.definitions[ name ] = statement;
			});

			keys( statement.modifies ).forEach( name => {
				( this.modifications[ name ] || ( this.modifications[ name ] = [] ) ).push( statement );
			});
		});

		// if names are referenced that are neither defined nor imported
		// in this module, we assume that they're globals
		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( !this.definitions[ name ] && !this.imports[ name ] ) {
					this.bundle.assumedGlobals[ name ] = true;
				}
			});
		});
	}

	consolidateDependencies () {
		let strongDependencies = blank();

		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration && !statement.node.specifiers.length && !statement.module.isExternal ) {
				// include module for its side-effects
				strongDependencies[ statement.module.id ] = statement.module; // TODO is this right? `statement.module` should be `this`, surely?
			}

			keys( statement.stronglyDependsOn ).forEach( name => {
				if ( statement.defines[ name ] ) return;

				const exportAllDeclaration = this.exportAlls[ name ];

				if ( exportAllDeclaration && exportAllDeclaration.module && !exportAllDeclaration.module.isExternal ) {
					strongDependencies[ exportAllDeclaration.module.id ] = exportAllDeclaration.module;
					return;
				}

				const importDeclaration = this.imports[ name ];

				if ( importDeclaration && importDeclaration.module && !importDeclaration.module.isExternal ) {
					strongDependencies[ importDeclaration.module.id ] = importDeclaration.module;
				}
			});
		});

		let weakDependencies = blank();

		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( statement.defines[ name ] ) return;

				const importDeclaration = this.imports[ name ];

				if ( importDeclaration && importDeclaration.module && !importDeclaration.module.isExternal ) {
					weakDependencies[ importDeclaration.module.id ] = importDeclaration.module;
				}
			});
		});

		return { strongDependencies, weakDependencies };
	}

	defaultName () {
		const defaultExport = this.exports.default;

		if ( !defaultExport ) return null;

		const name = defaultExport.identifier && !defaultExport.isModified ?
			defaultExport.identifier :
			this.replacements.default;

		return this.replacements[ name ] || name;
	}

	findDefiningStatement ( name ) {
		if ( this.definitions[ name ] ) return this.definitions[ name ];

		// TODO what about `default`/`*`?

		const importDeclaration = this.imports[ name ];
		if ( !importDeclaration ) return null;

		return Promise.resolve( importDeclaration.module || this.bundle.fetchModule( importDeclaration.source, this.id ) )
			.then( module => {
				importDeclaration.module = module;
				return module.findDefiningStatement( name );
			});
	}

	findDeclaration ( localName ) {
		const importDeclaration = this.imports[ localName ];

		// name was defined by another module
		if ( importDeclaration ) {
			const module = importDeclaration.module;

			if ( module.isExternal ) return null;
			if ( importDeclaration.name === '*' ) return null;

			const exportDeclaration = module.exports[ importDeclaration.name ];
			return module.findDeclaration( exportDeclaration.localName );
		}

		// name was defined by this module, if any
		let i = this.statements.length;
		while ( i-- ) {
			const declaration = this.statements[i].scope.declarations[ localName ];
			if ( declaration ) {
				return declaration;
			}
		}

		return null;
	}

	mark ( name ) {
		// shortcut cycles. TODO this won't work everywhere...
		if ( this.definitionPromises[ name ] ) {
			return emptyArrayPromise;
		}

		let promise;

		// The definition for this name is in a different module
		if ( this.imports[ name ] ) {
			const importDeclaration = this.imports[ name ];
			importDeclaration.isUsed = true;

			promise = this.bundle.fetchModule( importDeclaration.source, this.id )
				.then( module => {
					importDeclaration.module = module;

					// suggest names. TODO should this apply to non default/* imports?
					if ( importDeclaration.name === 'default' ) {
						// TODO this seems ropey
						const localName = importDeclaration.localName;
						let suggestion = this.suggestedNames[ localName ] || localName;

						// special case - the module has its own import by this name
						while ( !module.isExternal && module.imports[ suggestion ] ) {
							suggestion = `_${suggestion}`;
						}

						module.suggestName( 'default', suggestion );
					} else if ( importDeclaration.name === '*' ) {
						const localName = importDeclaration.localName;
						const suggestion = this.suggestedNames[ localName ] || localName;
						module.suggestName( '*', suggestion );
						module.suggestName( 'default', `${suggestion}__default` );
					}

					if ( importDeclaration.name === 'default' && ( module.isExternal || !module.exports.default.linkedImport ) ) { // special case - exclude `export { default } from ...`
						module.needsDefault = true;
					} else if ( importDeclaration.name === '*' ) {
						module.needsAll = true;
					} else {
						module.needsNamed = true;
					}

					if ( module.isExternal ) {
						module.importedByBundle.push( importDeclaration );
						return emptyArrayPromise;
					}

					if ( importDeclaration.name === '*' ) {
						// we need to create an internal namespace
						if ( !~this.bundle.internalNamespaceModules.indexOf( module ) ) {
							this.bundle.internalNamespaceModules.push( module );
						}

						return module.markAllExportStatements();
					}

					const exportDeclaration = module.exports[ importDeclaration.name ];

					if ( !exportDeclaration ) {
						const noExport = new Error( `Module ${module.id} does not export ${importDeclaration.name} (imported by ${this.id})` );

						// See if there exists an export delegate that defines `name`.
						return first( module.exportDelegates, noExport, declaration => {
							return module.bundle.fetchModule( declaration.source, module.id ).then( submodule => {
								declaration.module = submodule;

								return submodule.mark( name ).then( result => {
									if ( !result.length ) throw noExport;

									// It's found! This module exports `name` through declaration.
									// It is however not imported into this scope.
									module.exportAlls[ name ] = declaration;

									declaration.statement.dependsOn[ name ] =
									declaration.statement.stronglyDependsOn[ name ] = result;

									return result;
								});
							});
						});
					}

					if ( importDeclaration.name === 'default' ) {
						return exportDeclaration.statement.mark();
					}

					exportDeclaration.isUsed = true;
					return module.mark( exportDeclaration.localName );
				});
		}

		// The definition is in this module
		else if ( name === 'default' && this.exports.default.isDeclaration ) {
			// We have something like `export default foo` - so we just start again,
			// searching for `foo` instead of default
			promise = this.mark( this.exports.default.name ); // TODO this can't be right... this.exports.default.name === 'default'
		}

		else {
			let statement;

			statement = name === 'default' ? this.exports.default.statement : this.definitions[ name ];
			promise = statement && !statement.isIncluded ? statement.mark() : emptyArrayPromise;
		}

		this.definitionPromises[ name ] = promise || emptyArrayPromise;
		return this.definitionPromises[ name ];
	}

	markAllStatements ( isEntryModule ) {
		return sequence( this.statements, statement => {
			if ( statement.isIncluded ) return; // TODO can this happen? probably not...

			// skip import declarations...
			if ( statement.isImportDeclaration ) {
				// ...unless they're empty, in which case assume we're importing them for the side-effects
				// THIS IS NOT FOOLPROOF. Probably need /*rollup: include */ or similar
				if ( !statement.node.specifiers.length ) {
					return this.bundle.fetchModule( statement.node.source.value, this.id )
						.then( module => {
							statement.module = module;
							if ( module.isExternal ) {
								return;
							}
							return module.markAllStatements();
						});
				}

				return;
			}

			// skip `export { foo, bar, baz }`...
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// ...but ensure they are defined, if this is the entry module
				if ( isEntryModule ) {
					return statement.mark();
				}

				return;
			}

			// include everything else
			return statement.mark();
		});
	}

	markAllExportStatements () {
		return sequence( this.statements, statement => {
			return statement.isExportDeclaration ?
				statement.mark() :
				null;
		});
	}

	// TODO rename this to parse, once https://github.com/rollup/rollup/issues/42 is fixed
	_parse ( ast ) {
		// The ast can be supplied programmatically (but usually won't be)
		if ( !ast ) {
			// Try to extract a list of top-level statements/declarations. If
			// the parse fails, attach file info and abort
			try {
				ast = parse( this.source, {
					ecmaVersion: 6,
					sourceType: 'module',
					onComment: ( block, text, start, end ) => this.comments.push({ block, text, start, end })
				});
			} catch ( err ) {
				err.code = 'PARSE_ERROR';
				err.file = this.id; // see above - not necessarily true, but true enough
				throw err;
			}
		}

		walk( ast, {
			enter: node => {
				this.magicString.addSourcemapLocation( node.start );
				this.magicString.addSourcemapLocation( node.end );
			}
		});

		let statements = [];
		let lastChar = 0;
		let commentIndex = 0;

		ast.body.forEach( node => {
			// special case - top-level var declarations with multiple declarators
			// should be split up. Otherwise, we may end up including code we
			// don't need, just because an unwanted declarator is included
			if ( node.type === 'VariableDeclaration' && node.declarations.length > 1 ) {
				// remove the leading var/let/const
				this.magicString.remove( node.start, node.declarations[0].start );

				node.declarations.forEach( declarator => {
					const { start, end } = declarator;

					const syntheticNode = {
						type: 'VariableDeclaration',
						kind: node.kind,
						start,
						end,
						declarations: [ declarator ],
						isSynthetic: true
					};

					const statement = new Statement( syntheticNode, this, start, end );
					statements.push( statement );
				});

				lastChar = node.end; // TODO account for trailing line comment
			}

			else {
				let comment;
				do {
					comment = this.comments[ commentIndex ];
					if ( !comment ) break;
					if ( comment.start > node.start ) break;
					commentIndex += 1;
				} while ( comment.end < lastChar );

				const start = comment ? Math.min( comment.start, node.start ) : node.start;
				const end = node.end; // TODO account for trailing line comment

				const statement = new Statement( node, this, start, end );
				statements.push( statement );

				lastChar = end;
			}
		});

		statements.forEach( ( statement, i ) => {
			const nextStatement = statements[ i + 1 ];
			statement.next = nextStatement ? nextStatement.start : statement.end;
		});

		return statements;
	}

	rename ( name, replacement ) {
		this.replacements[ name ] = replacement;
	}

	render ( allBundleExports, moduleReplacements, format ) {
		let magicString = this.magicString.clone();

		this.statements.forEach( statement => {
			if ( !statement.isIncluded ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			// skip `export { foo, bar, baz }`
			if ( statement.node.type === 'ExportNamedDeclaration' ) {
				// skip `export { foo, bar, baz }`
				if ( statement.node.specifiers.length ) {
					magicString.remove( statement.start, statement.next );
					return;
				}

				// skip `export var foo;` if foo is exported
				if ( isEmptyExportedVarDeclaration( statement.node.declaration, this, allBundleExports, moduleReplacements, format === 'es6' ) ) {
					magicString.remove( statement.start, statement.next );
					return;
				}
			}

			// skip empty var declarations for exported bindings
			// (otherwise we're left with `exports.foo;`, which is useless)
			if ( isEmptyExportedVarDeclaration( statement.node, this, allBundleExports, moduleReplacements, format === 'es6' ) ) {
				magicString.remove( statement.start, statement.next );
				return;
			}

			// split up/remove var declarations as necessary
			if ( statement.node.isSynthetic ) {
				// insert `var/let/const` if necessary
				if ( !allBundleExports[ statement.node.declarations[0].id.name ] ) {
					magicString.insert( statement.start, `${statement.node.kind} ` );
				}

				magicString.overwrite( statement.end, statement.next, ';\n' ); // TODO account for trailing newlines
			}

			let replacements = blank();
			let bundleExports = blank();

			keys( statement.dependsOn )
				.concat( keys( statement.defines ) )
				.forEach( name => {
					const bundleName = moduleReplacements[ name ] || name;

					if ( allBundleExports[ bundleName ] ) {
						bundleExports[ name ] = replacements[ name ] = allBundleExports[ bundleName ];
					} else if ( bundleName !== name ) { // TODO weird structure
						replacements[ name ] = bundleName;
					}
				});

			statement.replaceIdentifiers( magicString, replacements, bundleExports );

			// modify exports as necessary
			if ( statement.isExportDeclaration ) {
				// remove `export` from `export var foo = 42`
				if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration' ) {
					magicString.remove( statement.node.start, statement.node.declaration.start );
				}

				// remove `export` from `export class Foo {...}` or `export default Foo`
				// TODO default exports need different treatment
				else if ( statement.node.declaration.id ) {
					magicString.remove( statement.node.start, statement.node.declaration.start );
				}

				else if ( statement.node.type === 'ExportDefaultDeclaration' ) {
					const canonicalName = this.defaultName();

					if ( statement.node.declaration.type === 'Identifier' && canonicalName === ( moduleReplacements[ statement.node.declaration.name ] || statement.node.declaration.name ) ) {
						magicString.remove( statement.start, statement.next );
						return;
					}

					// anonymous functions should be converted into declarations
					if ( statement.node.declaration.type === 'FunctionExpression' ) {
						magicString.overwrite( statement.node.start, statement.node.declaration.start + 8, `function ${canonicalName}` );
					} else {
						magicString.overwrite( statement.node.start, statement.node.declaration.start, `var ${canonicalName} = ` );
					}
				}

				else {
					throw new Error( 'Unhandled export' );
				}
			}
		});

		return magicString.trim();
	}

	suggestName ( defaultOrBatch, suggestion ) {
		// deconflict anonymous default exports with this module's definitions
		const shouldDeconflict = this.exports.default && this.exports.default.isAnonymous;

		if ( shouldDeconflict ) suggestion = deconflict( suggestion, this.definitions );

		if ( !this.suggestedNames[ defaultOrBatch ] ) {
			this.suggestedNames[ defaultOrBatch ] = makeLegalIdentifier( suggestion );
		}
	}
}
