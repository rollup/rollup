import { Promise } from 'sander';
import { parse } from 'acorn';
import MagicString from 'magic-string';
import Statement from './Statement';
import walk from './ast/walk';
import { blank, keys } from './utils/object';
import getLocation from './utils/getLocation';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

const emptyPromise = Promise.resolve();

function deconflict ( name, names ) {
	while ( name in names ) {
		name = `_${name}`;
	}

	return name;
}

function isEmptyExportedVarDeclaration ( node, allBundleExports, moduleReplacements ) {
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

		this.statements = this.parse( ast );

		// all dependencies
		this.dependencies = [];
		this.resolvedIds = blank();
		this.boundImportSpecifiers = false;

		// imports and exports, indexed by local name
		this.imports = blank();
		this.exports = blank();
		this.reexports = blank();
		this.exportDelegates = blank();

		this.exportAlls = [];

		this.replacements = blank();

		this.varDeclarations = [];

		this.marked = blank();
		this.definitions = blank();
		this.definitionPromises = blank();
		this.modifications = blank();

		this.analyse();
	}

	addExport ( statement ) {
		const node = statement.node;
		const source = node.source && node.source.value;

		// export { name } from './other'
		if ( source ) {
			if ( !~this.dependencies.indexOf( source ) ) this.dependencies.push( source );

			if ( node.type === 'ExportAllDeclaration' ) {
				// Store `export * from '...'` statements in an array of delegates.
				// When an unknown import is encountered, we see if one of them can satisfy it.
				this.exportAlls.push({
					statement,
					source
				});
			}

			else {
				node.specifiers.forEach( specifier => {
					this.reexports[ specifier.exported.name ] = {
						source,
						localName: specifier.local.name,
						module: null // filled in later
					};
				});
			}
		}

		// export default function foo () {}
		// export default foo;
		// export default 42;
		else if ( node.type === 'ExportDefaultDeclaration' ) {
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

					this.exports[ exportedName ] = {
						statement,
						localName,
						exportedName
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
	}

	addImport ( statement ) {
		const node = statement.node;
		const source = node.source.value;

		if ( !~this.dependencies.indexOf( source ) ) this.dependencies.push( source );

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

			statement.scope.varDeclarations.forEach( name => {
				this.varDeclarations.push( name );
			});

			keys( statement.modifies ).forEach( name => {
				( this.modifications[ name ] || ( this.modifications[ name ] = [] ) ).push( statement );
			});
		});

		// if names are referenced that are neither defined nor imported
		// in this module, we assume that they're globals
		this.statements.forEach( statement => {
			if ( statement.isReexportDeclaration ) return;

			keys( statement.dependsOn ).forEach( name => {
				if ( !this.definitions[ name ] && !this.imports[ name ] ) {
					this.bundle.assumedGlobals[ name ] = true;
				}
			});
		});
	}

	bindImportSpecifiers () {
		if ( this.boundImportSpecifiers ) return;
		this.boundImportSpecifiers = true;

		[ this.imports, this.reexports ].forEach( specifiers => {
			keys( specifiers ).forEach( name => {
				const specifier = specifiers[ name ];

				if ( specifier.module ) return;

				const id = this.resolvedIds[ specifier.source ];
				specifier.module = this.bundle.moduleById[ id ];
			});
		});

		this.exportAlls.forEach( delegate => {
			const id = this.resolvedIds[ delegate.source ];
			delegate.module = this.bundle.moduleById[ id ];
		});

		this.dependencies.forEach( source => {
			const id = this.resolvedIds[ source ];
			const module = this.bundle.moduleById[ id ];

			if ( !module.isExternal ) module.bindImportSpecifiers();
		});
	}

	consolidateDependencies () {
		let strongDependencies = blank();

		function addDependency ( dependencies, declaration ) {
			if ( declaration && declaration.module && !declaration.module.isExternal ) {
				dependencies[ declaration.module.id ] = declaration.module;
				return true;
			}
		}

		this.statements.forEach( statement => {
			if ( statement.isImportDeclaration && !statement.node.specifiers.length ) {
				// include module for its side-effects
				const id = this.resolvedIds[ statement.node.source.value ];
				const module = this.bundle.moduleById[ id ];

				if ( !module.isExternal ) strongDependencies[ module.id ] = module;
			}

			else if ( statement.isReexportDeclaration ) {
				if ( statement.node.specifiers ) {
					statement.node.specifiers.forEach( specifier => {
						let reexport;

						let module = this;
						let name = specifier.exported.name;
						while ( !module.isExternal && module.reexports[ name ] && module.reexports[ name ].isUsed ) {
							reexport = module.reexports[ name ];
							module = reexport.module;
							name = reexport.localName;
						}

						addDependency( strongDependencies, reexport );
					});
				}
			}

			else {
				keys( statement.stronglyDependsOn ).forEach( name => {
					if ( statement.defines[ name ] ) return;

					addDependency( strongDependencies, this.exportDelegates[ name ] ) ||
					addDependency( strongDependencies, this.imports[ name ] );
				});
			}
		});

		let weakDependencies = blank();

		this.statements.forEach( statement => {
			keys( statement.dependsOn ).forEach( name => {
				if ( statement.defines[ name ] ) return;

				addDependency( weakDependencies, this.exportDelegates[ name ] ) ||
				addDependency( weakDependencies, this.imports[ name ] );
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

		return importDeclaration.module.findDefiningStatement( name );
	}

	mark ( name ) {
		// shortcut cycles
		if ( this.marked[ name ] ) return;
		this.marked[ name ] = true;

		// The definition for this name is in a different module
		if ( this.imports[ name ] ) {
			const importDeclaration = this.imports[ name ];
			importDeclaration.isUsed = true;

			const module = importDeclaration.module;

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

			if ( importDeclaration.name === 'default' ) {
				module.needsDefault = true;
			} else if ( importDeclaration.name === '*' ) {
				module.needsAll = true;
			} else {
				module.needsNamed = true;
			}

			if ( module.isExternal ) {
				module.importedByBundle.push( importDeclaration );
			}

			else if ( importDeclaration.name === '*' ) {
				// we need to create an internal namespace
				if ( !~this.bundle.internalNamespaceModules.indexOf( module ) ) {
					this.bundle.internalNamespaceModules.push( module );
				}

				module.markAllExportStatements();
			}

			else {
				module.markExport( importDeclaration.name, name, this );
			}
		}

		else {
			const statement = name === 'default' ? this.exports.default.statement : this.definitions[ name ];
			if ( statement ) statement.mark();
		}
	}

	markAllStatements ( isEntryModule ) {
		this.statements.forEach( statement => {
			if ( statement.isIncluded ) return; // TODO can this happen? probably not...

			// skip import declarations...
			if ( statement.isImportDeclaration ) {
				// ...unless they're empty, in which case assume we're importing them for the side-effects
				// THIS IS NOT FOOLPROOF. Probably need /*rollup: include */ or similar
				if ( !statement.node.specifiers.length ) {
					const id = this.resolvedIds[ statement.node.source.value ];
					const otherModule = this.bundle.moduleById[ id ];

					if ( !otherModule.isExternal ) otherModule.markAllStatements();
				}
			}

			// skip `export { foo, bar, baz }`...
			else if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				// ...but ensure they are defined, if this is the entry module
				if ( isEntryModule ) statement.mark();
			}

			// include everything else
			else {
				statement.mark();
			}
		});
	}

	markAllExportStatements () {
		this.statements.forEach( statement => {
			if ( statement.isExportDeclaration ) statement.mark();
		});
	}

	markExport ( name, suggestedName, importer ) {
		const reexport = this.reexports[ name ];
		const exportDeclaration = this.exports[ name ];

		if ( reexport ) {
			reexport.isUsed = true;
			reexport.module.markExport( reexport.localName, suggestedName, this );
		}

		else if ( exportDeclaration ) {
			exportDeclaration.isUsed = true;
			if ( name === 'default' ) {
				this.needsDefault = true;
				this.suggestName( 'default', suggestedName );
				return exportDeclaration.statement.mark();
			}

			this.mark( exportDeclaration.localName );
		}

		else {
			// See if there exists an export delegate that defines `name`.
			let i;
			for ( i = 0; i < this.exportAlls.length; i += 1 ) {
				const declaration = this.exportAlls[i];

				if ( declaration.module.exports[ name ] ) {
					// It's found! This module exports `name` through declaration.
					// It is however not imported into this scope.
					this.exportDelegates[ name ] = declaration;
					declaration.module.markExport( name );

					declaration.statement.dependsOn[ name ] =
					declaration.statement.stronglyDependsOn[ name ] = true;

					return;
				}
			}

			throw new Error( `Module ${this.id} does not export ${name} (imported by ${importer.id})` );
		}
	}

	parse ( ast ) {
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

	render ( allBundleExports, moduleReplacements ) {
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
				if ( isEmptyExportedVarDeclaration( statement.node.declaration, allBundleExports, moduleReplacements ) ) {
					magicString.remove( statement.start, statement.next );
					return;
				}
			}

			// skip empty var declarations for exported bindings
			// (otherwise we're left with `exports.foo;`, which is useless)
			if ( isEmptyExportedVarDeclaration( statement.node, allBundleExports, moduleReplacements ) ) {
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

					// prevent `var undefined = sideEffectyDefault(foo)`
					if ( canonicalName === undefined ) {
						magicString.remove( statement.start, statement.node.declaration.start );
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
