import { basename, dirname, extname, relative, resolve } from 'path';
import { readFile, Promise } from 'sander';
import MagicString from 'magic-string';
import { blank, keys } from './utils/object';
import Module from './Module';
import ExternalModule from './ExternalModule';
import finalisers from './finalisers/index';
import makeLegalIdentifier from './utils/makeLegalIdentifier';
import ensureArray from './utils/ensureArray';
import { defaultResolver, defaultExternalResolver } from './utils/resolvePath';
import { defaultLoader } from './utils/load';
import getExportMode from './utils/getExportMode';
import getIndentString from './utils/getIndentString';
import { unixizePath } from './utils/normalizePlatform.js';

function badExports ( option, keys ) {
	throw new Error( `'${option}' was specified for options.exports, but entry module has following exports: ${keys.join(', ')}` );
}

export default class Bundle {
	constructor ( options ) {
		this.entryPath = resolve( options.entry ).replace( /\.js$/, '' ) + '.js';
		this.base = dirname( this.entryPath );

		this.resolvePath = options.resolvePath || defaultResolver;
		this.load = options.load || defaultLoader;

		this.resolvePathOptions = {
			external: ensureArray( options.external ),
			resolveExternal: options.resolveExternal || defaultExternalResolver
		};

		this.loadOptions = {
			transform: ensureArray( options.transform )
		};

		this.entryModule = null;

		this.varExports = blank();
		this.toExport = null;

		this.modulePromises = blank();
		this.statements = [];
		this.externalModules = [];
		this.internalNamespaceModules = [];
	}

	fetchModule ( importee, importer ) {
		return Promise.resolve( importer === null ? importee : this.resolvePath( importee, importer, this.resolvePathOptions ) )
			.then( path => {
				if ( !path ) {
					// external module
					if ( !this.modulePromises[ importee ] ) {
						const module = new ExternalModule( importee );
						this.externalModules.push( module );
						this.modulePromises[ importee ] = Promise.resolve( module );
					}

					return this.modulePromises[ importee ];
				}

				if ( !this.modulePromises[ path ] ) {
					this.modulePromises[ path ] = Promise.resolve( this.load( path, this.loadOptions ) )
						.then( source => {
							const module = new Module({
								path,
								source,
								bundle: this
							});

							return module;
						});
				}

				return this.modulePromises[ path ];
			});
	}

	build () {
		// bring in top-level AST nodes from the entry module
		return this.fetchModule( this.entryPath, null )
			.then( entryModule => {
				const defaultExport = entryModule.exports.default;

				this.entryModule = entryModule;

				if ( defaultExport ) {
					// `export default function foo () {...}` -
					// use the declared name for the export
					if ( defaultExport.declaredName ) {
						entryModule.suggestName( 'default', defaultExport.declaredName );
					}

					// `export default a + b` - generate an export name
					// based on the filename of the entry module
					else {
						let defaultExportName = makeLegalIdentifier( basename( this.entryPath ).slice( 0, -extname( this.entryPath ).length ) );

						// deconflict
						let topLevelNames = [];
						entryModule.statements.forEach( statement => {
							keys( statement.defines ).forEach( name => topLevelNames.push( name ) );
						});

						while ( ~topLevelNames.indexOf( defaultExportName ) ) {
							defaultExportName = `_${defaultExportName}`;
						}

						entryModule.suggestName( 'default', defaultExportName );
					}
				}

				return entryModule.expandAllStatements( true );
			})
			.then( statements => {
				this.statements = statements;
				this.deconflict();
			});
	}

	deconflict () {
		let definers = blank();
		let conflicts = blank();

		// Discover conflicts (i.e. two statements in separate modules both define `foo`)
		this.statements.forEach( statement => {
			const module = statement.module;
			const names = keys( statement.defines );

			// with default exports that are expressions (`export default 42`),
			// we need to ensure that the name chosen for the expression does
			// not conflict
			if ( statement.node.type === 'ExportDefaultDeclaration' ) {
				const name = module.getCanonicalName( 'default' );

				const isProxy = statement.node.declaration && statement.node.declaration.type === 'Identifier';
				const shouldDeconflict = !isProxy || ( module.getCanonicalName( statement.node.declaration.name ) !== name );

				if ( shouldDeconflict && !~names.indexOf( name ) ) {
					names.push( name );
				}
			}

			names.forEach( name => {
				if ( definers[ name ] ) {
					conflicts[ name ] = true;
				} else {
					definers[ name ] = [];
				}

				// TODO in good js, there shouldn't be duplicate definitions
				// per module... but some people write bad js
				definers[ name ].push( module );
			});
		});

		// Assign names to external modules
		this.externalModules.forEach( module => {
			// TODO is this right?
			let name = makeLegalIdentifier( module.suggestedNames['*'] || module.suggestedNames.default || module.id );

			if ( definers[ name ] ) {
				conflicts[ name ] = true;
			} else {
				definers[ name ] = [];
			}

			definers[ name ].push( module );
			module.name = name;
		});

		// Rename conflicting identifiers so they can live in the same scope
		keys( conflicts ).forEach( name => {
			const modules = definers[ name ];

			modules.pop(); // the module closest to the entryModule gets away with keeping things as they are

			modules.forEach( module => {
				const replacement = getSafeName( name );
				module.rename( name, replacement );
			});
		});

		function getSafeName ( name ) {
			while ( conflicts[ name ] ) {
				name = `_${name}`;
			}

			conflicts[ name ] = true;
			return name;
		}
	}

	generate ( options = {} ) {
		let magicString = new MagicString.Bundle({ separator: '' });

		const format = options.format || 'es6';

		// If we have named exports from the bundle, and those exports
		// are assigned to *within* the bundle, we may need to rewrite e.g.
		//
		//   export let count = 0;
		//   export function incr () { count++ }
		//
		// might become...
		//
		//   exports.count = 0;
		//   function incr () {
		//     exports.count += 1;
		//   }
		//   exports.incr = incr;
		//
		// This doesn't apply if the bundle is exported as ES6!
		let allBundleExports = blank();

		if ( format !== 'es6' ) {
			keys( this.entryModule.exports ).forEach( key => {
				const exportDeclaration = this.entryModule.exports[ key ];

				const originalDeclaration = this.entryModule.findDeclaration( exportDeclaration.localName );

				if ( originalDeclaration && originalDeclaration.type === 'VariableDeclaration' ) {
					const canonicalName = this.entryModule.getCanonicalName( exportDeclaration.localName );

					allBundleExports[ canonicalName ] = `exports.${key}`;
					this.varExports[ key ] = true;
				}
			});
		}

		// since we're rewriting variable exports, we want to
		// ensure we don't try and export them again at the bottom
		this.toExport = keys( this.entryModule.exports )
			.filter( key => !this.varExports[ key ] );

		// Apply new names and add to the output bundle
		let previousModule = null;
		let previousIndex = -1;
		let previousMargin = 0;

		// within a module, statements should preserve their original order
		// TODO is this foolproof?
		this.statements.sort( ( a, b ) => {
			if ( a.module !== b.module ) return -1; // no change
			return a.index - b.index;
		});

		this.statements.forEach( statement => {
			// skip `export { foo, bar, baz }`
			if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.specifiers.length ) {
				return;
			}

			let replacements = blank();
			let bundleExports = blank();

			keys( statement.dependsOn )
				.concat( keys( statement.defines ) )
				.forEach( name => {
					const canonicalName = statement.module.getCanonicalName( name );

					if ( allBundleExports[ canonicalName ] ) {
						bundleExports[ name ] = replacements[ name ] = allBundleExports[ canonicalName ];
					} else if ( name !== canonicalName ) {
						replacements[ name ] = canonicalName;
					}
				});

			const source = statement.replaceIdentifiers( replacements, bundleExports );

			// modify exports as necessary
			if ( statement.isExportDeclaration ) {
				// remove `export` from `export var foo = 42`
				if ( statement.node.type === 'ExportNamedDeclaration' && statement.node.declaration.type === 'VariableDeclaration' ) {
					source.remove( statement.node.start, statement.node.declaration.start );
				}

				// remove `export` from `export class Foo {...}` or `export default Foo`
				// TODO default exports need different treatment
				else if ( statement.node.declaration.id ) {
					source.remove( statement.node.start, statement.node.declaration.start );
				}

				else if ( statement.node.type === 'ExportDefaultDeclaration' ) {
					const module = statement.module;
					const canonicalName = module.getCanonicalName( 'default' );

					if ( statement.node.declaration.type === 'Identifier' && canonicalName === module.getCanonicalName( statement.node.declaration.name ) ) {
						return;
					}

					source.overwrite( statement.node.start, statement.node.declaration.start, `var ${canonicalName} = ` );
				}

				else {
					throw new Error( 'Unhandled export' );
				}
			}

			// ensure there is always a newline between statements, and add
			// additional newlines as necessary to reflect original source
			const minSeparation = ( previousModule !== statement.module ) || ( statement.index !== previousIndex + 1 ) ? 3 : 2;
			const margin = Math.max( minSeparation, statement.margin[0], previousMargin );
			let newLines = new Array( margin ).join( '\n' );

			// add leading comments
			if ( statement.leadingComments.length ) {
				const commentBlock = newLines + statement.leadingComments.map( ({ separator, comment }) => {
					return separator + ( comment.block ?
						`/*${comment.text}*/` :
						`//${comment.text}` );
				}).join( '' );

				magicString.addSource( new MagicString( commentBlock ) );
				newLines = new Array( statement.margin[0] ).join( '\n' ); // TODO handle gaps between comment block and statement
			}

			// add the statement itself
			magicString.addSource({
				content: source,
				separator: newLines
			});

			// add trailing comments
			const comment = statement.trailingComment;
			if ( comment ) {
				const commentBlock = comment.block ?
					` /*${comment.text}*/` :
					` //${comment.text}`;

				magicString.append( commentBlock );
			}

			previousMargin = statement.margin[1];
			previousModule = statement.module;
			previousIndex  = statement.index;
		});

		// prepend bundle with internal namespaces
		const indentString = magicString.getIndentString();
		const namespaceBlock = this.internalNamespaceModules.map( module => {
			const exportKeys = keys( module.exports );

			return `var ${module.getCanonicalName('*')} = {\n` +
				exportKeys.map( key => `${indentString}get ${key} () { return ${module.getCanonicalName(key)}; }` ).join( ',\n' ) +
			`\n};\n\n`;
		}).join( '' );

		magicString.prepend( namespaceBlock );

		const finalise = finalisers[ format ];

		if ( !finalise ) {
			throw new Error( `You must specify an output type - valid options are ${keys( finalisers ).join( ', ' )}` );
		}

		magicString = finalise( this, magicString.trim(), {
			// Determine export mode - 'default', 'named', 'none'
			exportMode: getExportMode( this, options.exports ),

			// Determine indentation
			indentString: getIndentString( magicString, options )
		}, options );

		const code = magicString.toString();
		let map = null;

		if ( options.sourceMap ) {
			map = magicString.generateMap({
				includeContent: true,
				file: options.sourceMapFile || options.dest
				// TODO
			});

			// make sources relative. TODO fix this upstream?
			const dir = dirname( map.file );
			map.sources = map.sources.map( source => {
				return source ? unixizePath( relative( dir, source ) ) : null
			});
		}

		return { code, map };
	}
}
