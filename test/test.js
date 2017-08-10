require( 'source-map-support' ).install();
require( 'console-group' ).install();

const path = require( 'path' );
const sander = require( 'sander' );
const assert = require( 'assert' );
const { exec } = require( 'child_process' );
const buble = require( 'buble' );
const acorn = require( 'acorn' );
const rollup = require( '../dist/rollup' );

const FUNCTION = path.resolve( __dirname, 'function' );
const FORM = path.resolve( __dirname, 'form' );
const SOURCEMAPS = path.resolve( __dirname, 'sourcemaps' );
const CLI = path.resolve( __dirname, 'cli' );

const cwd = process.cwd();

const PROFILES = [
	{ format: 'amd' },
	{ format: 'cjs' },
	{ format: 'es' },
	{ format: 'iife' },
	{ format: 'umd' }
];

function extend ( target ) {
	[].slice.call( arguments, 1 ).forEach( source => {
		source && Object.keys( source ).forEach( key => {
			target[ key ] = source[ key ];
		});
	});

	return target;
}

function normaliseOutput ( code ) {
	return code.toString().trim().replace( /\r\n/g, '\n' );
}

function loadConfig ( path ) {
	try {
		return require( path );
	} catch ( err ) {
		console.error( err.message );
		console.error( err.stack );
		throw new Error( `Failed to load ${path}. An old test perhaps? You should probably delete the directory` );
	}
}

function loader ( modules ) {
	return {
		resolveId ( id ) {
			return id in modules ? id : null;
		},

		load ( id ) {
			return modules[ id ];
		}
	};
}

function deindent ( str ) {
	return str.slice( 1 ).replace( /^\t+/gm, '' ).replace( /\s+$/gm, '' ).trim();
}

function compareWarnings ( actual, expected ) {
	assert.deepEqual(
		actual.map( warning => {
			const clone = Object.assign( {}, warning );
			delete clone.toString;

			if ( clone.frame ) {
				clone.frame = clone.frame.replace( /\s+$/gm, '' );
			}

			return clone;
		}),
		expected.map( warning => {
			if ( warning.frame ) {
				warning.frame = deindent( warning.frame );
			}
			return warning;
		})
	);
}

function compareError ( actual, expected ) {
	delete actual.stack;
	actual = Object.assign( {}, actual, {
		message: actual.message
	});

	if ( actual.frame ) {
		actual.frame = actual.frame.replace( /\s+$/gm, '' );
	}

	if ( expected.frame ) {
		expected.frame = deindent( expected.frame );
	}

	assert.deepEqual( actual, expected );
}

function wait ( ms ) {
	return new Promise( fulfil => {
		setTimeout( fulfil, ms );
	});
}

describe( 'rollup', function () {
	this.timeout( 10000 );

	describe( 'sanity checks', () => {
		it( 'exists', () => {
			assert.ok( !!rollup );
		});

		it( 'has a rollup method', () => {
			assert.equal( typeof rollup.rollup, 'function' );
		});

		it( 'fails without options', () => {
			return rollup.rollup()
				.then( () => {
					throw new Error( 'Missing expected error' );
				})
				.catch( err => {
					assert.equal( err.message, 'You must supply an options object to rollup' );
				});
		});

		it( 'fails without options.entry', () => {
			return rollup.rollup({})
				.then( () => {
					throw new Error( 'Missing expected error' );
				})
				.catch( err => {
					assert.equal( err.message, 'You must supply options.entry to rollup' );
				});
		});

		it( 'fails with invalid keys', () => {
			return rollup.rollup({ entry: 'x', plUgins: [] }).then( () => {
				throw new Error( 'Missing expected error' );
			}, err => {
				assert.equal( err.message, 'Unexpected key \'plUgins\' found, expected one of: acorn, amd, banner, cache, context, dest, entry, exports, extend, external, footer, format, globals, indent, interop, intro, legacy, moduleContext, moduleName, noConflict, onwarn, outro, paths, plugins, preferConst, pureExternalModules, sourceMap, sourceMapFile, targets, treeshake, useStrict, watch' );
			});
		});

		it( 'treats Literals as leaf nodes, even if first literal encountered is null', () => {
			// this test has to be up here, otherwise the bug doesn't have
			// an opportunity to present itself
			return rollup.rollup({
				entry: 'x',
				plugins: [ loader({ x: `var a = null; a = 'a string';` }) ]
			});
		});

		it( 'includes a newline at the end of the bundle', () => {
			return rollup.rollup({
				entry: 'x',
				plugins: [ loader({ x: `console.log( 42 );` }) ]
			}).then( bundle => {
				return bundle.generate({ format: 'iife' });
			}).then( ({ code }) => {
				assert.ok( code[ code.length - 1 ] === '\n' );
			});
		});

		it( 'throws on missing format option', () => {
			const warnings = [];

			return rollup.rollup({
				entry: 'x',
				plugins: [ loader({ x: `console.log( 42 );` }) ],
				onwarn: warning => warnings.push( warning )
			}).then( bundle => {
				assert.throws(() => {
					bundle.generate();
				}, /You must supply an output format/ );
			});
		});
	});

	describe( 'deprecations', () => {
		it( 'throws a useful error on accessing code/map properties of bundle.generate promise', () => {
			return rollup.rollup({
				entry: 'x',
				plugins: [ loader({ x: `console.log( 42 );` }) ]
			}).then( bundle => {
				let errored = false;

				try {
					const { code, map } = bundle.generate({ format: 'es' });
					console.log( code, map );
				} catch ( err ) {
					assert.equal( err.message, `bundle.generate(...) now returns a Promise instead of a { code, map } object` );
					errored = true;
				}

				assert.ok( errored );
			});
		});
	});

	describe( 'bundle.write()', () => {
		it( 'fails without options or options.dest', () => {
			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: () => { return 'test'; },
					load: () => {
						return '// empty';
					}
				}]
			}).then( bundle => {
				assert.throws( () => {
					bundle.write();
				}, /must supply options\.dest/ );

				assert.throws( () => {
					bundle.write({});
				}, /must supply options\.dest/ );
			});
		});

		it( 'expects options.moduleName for IIFE and UMD bundles', () => {
			let bundle;

			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: () => { return 'test'; },
					load: () => {
						return 'export var foo = 42;';
					}
				}]
			}).then( rollupInstance => {
				bundle = rollupInstance;
				return bundle.generate({
					format: 'umd'
				});
			}).catch( err => {
				assert.throws( () => {
					throw err;
				}, /You must supply options\.moduleName for UMD bundles/ );
			}).then( () => {
				return bundle.generate({
					format: 'iife'
				});
			}).catch( err => {
				assert.throws( () => {
					throw err;
				}, /You must supply options\.moduleName for IIFE bundles/ );
			});
		});

		it( 'throws on es6 format', () => {
			return rollup.rollup({
				entry: 'x',
				plugins: [{
					resolveId: () => { return 'test'; },
					load: () => {
						return '// empty';
					}
				}]
			}).then( bundle => {
				assert.throws(() => {
					return bundle.generate({ format: 'es6' });
				}, /The `es6` output format is deprecated – use `es` instead/);
			});
		});
	});

	describe( 'function', () => {
		sander.readdirSync( FUNCTION ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			const config = loadConfig( FUNCTION + '/' + dir + '/_config.js' );
			( config.skip ? it.skip : config.solo ? it.only : it )( dir, () => {
				process.chdir( FUNCTION + '/' + dir );

				const warnings = [];
				const captureWarning = msg => warnings.push( msg );

				const options = extend( {
					entry: FUNCTION + '/' + dir + '/main.js',
					onwarn: captureWarning
				}, config.options );

				if ( config.solo ) console.group( dir );

				return rollup.rollup( options )
					.then( bundle => {
						let unintendedError;

						if ( config.error ) {
							throw new Error( 'Expected an error while rolling up' );
						}

						let result;

						// try to generate output
						return Promise.resolve().then( () => {
							return bundle.generate( extend( {}, config.bundleOptions, {
								format: 'cjs'
							}));
						}).then( code => {
							if ( config.generateError ) {
								unintendedError = new Error( 'Expected an error while generating output' );
							}

							result = code;
						}).catch( err => {
							if ( config.generateError ) {
								compareError( err, config.generateError );
							} else {
								unintendedError = err;
							}
						}).then( () => {
							if ( unintendedError ) throw unintendedError;
							if ( config.error || config.generateError ) return;

							let code = result.code;

							if ( config.buble ) {
								code = buble.transform( code, {
									transforms: { modules: false }
								}).code;
							}

							if ( config.code ) config.code( code );

							const module = {
								exports: {}
							};

							const context = extend({ require, module, assert, exports: module.exports }, config.context || {} );

							const contextKeys = Object.keys( context );
							const contextValues = contextKeys.map( key => context[ key ] );

							try {
								const fn = new Function( contextKeys, code );
								fn.apply( {}, contextValues );

								if ( config.runtimeError ) {
									unintendedError = new Error( 'Expected an error while executing output' );
								} else {
									if ( config.exports ) config.exports( module.exports );
									if ( config.bundle ) config.bundle( bundle );
								}
							} catch ( err ) {
								if ( config.runtimeError ) {
									config.runtimeError( err );
								} else {
									unintendedError = err;
								}
							}

							if ( config.show || unintendedError ) {
								console.log( result.code + '\n\n\n' );
							}

							if ( config.warnings ) {
								if ( Array.isArray( config.warnings ) ) {
									compareWarnings( warnings, config.warnings );
								} else {
									config.warnings( warnings );
								}
							} else if ( warnings.length ) {
								throw new Error( `Got unexpected warnings:\n${warnings.join('\n')}` );
							}

							if ( config.solo ) console.groupEnd();

							if ( unintendedError ) throw unintendedError;
						});
					})
					.catch( err => {
						if ( config.error ) {
							compareError( err, config.error );
						} else {
							throw err;
						}
					});
			});
		});
	});

	describe( 'form', () => {
		sander.readdirSync( FORM ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			const config = loadConfig( FORM + '/' + dir + '/_config.js' );

			if ( config.skipIfWindows && process.platform === 'win32' ) return;
			if ( !config.options ) {
				config.options = {};
			}
			if ( !( 'indent' in config.options ) ) {
				config.options.indent = true;
			}

			const options = extend( {}, {
				entry: FORM + '/' + dir + '/main.js',
				onwarn: msg => {
					if ( /No name was provided for/.test( msg ) ) return;
					if ( /as external dependency/.test( msg ) ) return;
					console.error( msg );
				}
			}, config.options );

			( config.skip ? describe.skip : config.solo ? describe.only : describe )( dir, () => {
				let promise;
				const createBundle = () => ( promise || ( promise = rollup.rollup( options ) ) );

				PROFILES.forEach( profile => {
					it( 'generates ' + profile.format, () => {
						process.chdir( FORM + '/' + dir );

						return createBundle().then( bundle => {
							const options = extend( {}, config.options, {
								dest: FORM + '/' + dir + '/_actual/' + profile.format + '.js',
								format: profile.format
							});

							return bundle.write( options ).then( () => {
								const actualCode = normaliseOutput( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js' ) );
								let expectedCode;
								let actualMap;
								let expectedMap;

								try {
									expectedCode = normaliseOutput( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js' ) );
								} catch ( err ) {
									expectedCode = 'missing file';
								}

								try {
									actualMap = JSON.parse( sander.readFileSync( FORM, dir, '_actual', profile.format + '.js.map' ).toString() );
									actualMap.sourcesContent = actualMap.sourcesContent.map( normaliseOutput );
								} catch ( err ) {
									assert.equal( err.code, 'ENOENT' );
								}

								try {
									expectedMap = JSON.parse( sander.readFileSync( FORM, dir, '_expected', profile.format + '.js.map' ).toString() );
									expectedMap.sourcesContent = expectedMap.sourcesContent.map( normaliseOutput );
								} catch ( err ) {
									assert.equal( err.code, 'ENOENT' );
								}

								if ( config.show ) {
									console.log( actualCode + '\n\n\n' );
								}

								assert.equal( actualCode, expectedCode );
								assert.deepEqual( actualMap, expectedMap );
							});
						});
					});
				});
			});
		});
	});

	describe( 'sourcemaps', () => {
		sander.readdirSync( SOURCEMAPS ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, () => {
				process.chdir( SOURCEMAPS + '/' + dir );
				const config = loadConfig( SOURCEMAPS + '/' + dir + '/_config.js' );

				const entry = path.resolve( SOURCEMAPS, dir, 'main.js' );
				const dest = path.resolve( SOURCEMAPS, dir, '_actual/bundle' );

				let warnings;

				const options = extend( {}, config.options, {
					entry,
					onwarn: warning => warnings.push( warning )
				});

				PROFILES.forEach( profile => {
					( config.skip ? it.skip : config.solo ? it.only : it )( 'generates ' + profile.format, () => {
						process.chdir( SOURCEMAPS + '/' + dir );
						warnings = [];

						const testBundle = (bundle) => {
							const options = extend( {}, {
								format: profile.format,
								sourceMap: true,
								dest: `${dest}.${profile.format}.js`
							}, config.options );

							bundle.write( options );

							bundle.generate( options ).then( ({ code, map }) => {
								if ( config.test ) {
									config.test( code, map, profile );
								}

								if ( config.warnings ) {
									compareWarnings( warnings, config.warnings );
								} else if ( warnings.length ) {
									throw new Error( `Unexpected warnings` );
								}
							});
						};

						return rollup.rollup( options ).then(bundle => {
							testBundle(bundle);
							// cache rebuild does not reemit warnings.
							if ( config.warnings ) {
								return;
							}
							// test cache noop rebuild
							return rollup.rollup( extend({ cache: bundle }, options) ).then(bundle => {
								testBundle(bundle);
							});
						});
					});
				});
			});
		});
	});

	describe( 'cli', () => {
		sander.readdirSync( CLI ).sort().forEach( dir => {
			if ( dir[0] === '.' ) return; // .DS_Store...

			describe( dir, () => {
				const config = loadConfig( CLI + '/' + dir + '/_config.js' );

				( config.skip ? it.skip : config.solo ? it.only : it )( dir, done => {
					process.chdir( config.cwd || path.resolve( CLI, dir ) );

					const command = 'node ' + path.resolve( __dirname, '../bin' ) + path.sep + config.command;

					exec( command, {}, ( err, code, stderr ) => {
						if ( err ) {
							if ( config.error ) {
								config.error( err );
								return done();
							} else {
								throw err;
							}
						}

						if ( 'stderr' in config ) {
							assert.equal( deindent( config.stderr ), stderr.trim() );
						} else if ( stderr ) {
							console.error( stderr );
						}

						let unintendedError;

						if ( config.execute ) {
							try {
								if ( config.buble ) {
									code = buble.transform( code, {
										transforms: { modules: false }
									}).code;
								}

								const fn = new Function( 'require', 'module', 'exports', 'assert', code );
								const module = {
									exports: {}
								};
								fn( require, module, module.exports, assert );

								if ( config.error ) {
									unintendedError = new Error( 'Expected an error while executing output' );
								}

								if ( config.exports ) {
									config.exports( module.exports );
								}
							} catch ( err ) {
								if ( config.error ) {
									config.error( err );
								} else {
									unintendedError = err;
								}
							}

							if ( config.show || unintendedError ) {
								console.log( code + '\n\n\n' );
							}

							if ( config.solo ) console.groupEnd();

							unintendedError ? done( unintendedError ) : done();
						}

						else if ( config.result ) {
							try {
								config.result( code );
								done();
							} catch ( err ) {
								done( err );
							}
						}

						else if ( sander.existsSync( '_expected' ) && sander.statSync( '_expected' ).isDirectory() ) {
							let error = null;
							sander.readdirSync( '_expected' ).forEach( child => {
								const expected = sander.readFileSync( path.join( '_expected', child ) ).toString();
								const actual = sander.readFileSync( path.join( '_actual', child ) ).toString();
								try {
									assert.equal( normaliseOutput( actual ), normaliseOutput( expected ) );
								} catch ( err ) {
									error = err;
								}
							});
							done( error );
						}

						else {
							const expected = sander.readFileSync( '_expected.js' ).toString();
							try {
								assert.equal( normaliseOutput( code ), normaliseOutput( expected ) );
								done();
							} catch ( err ) {
								done( err );
							}
						}
					});
				});
			});
		});
	});

	describe( 'incremental', () => {
		function executeBundle ( bundle ) {
			return bundle.generate({
				format: 'cjs'
			}).then( cjs => {
				const m = new Function( 'module', 'exports', cjs.code );

				const module = { exports: {} };
				m( module, module.exports );

				return module.exports;
			});
		}

		let resolveIdCalls;
		let transformCalls;
		let modules;

		const plugin = {
			resolveId: id => {
				resolveIdCalls += 1;
				return id;
			},

			load: id => {
				return modules[ id ];
			},

			transform: code => {
				transformCalls += 1;
				return code;
			}
		};

		beforeEach( () => {
			resolveIdCalls = 0;
			transformCalls = 0;

			modules = {
				entry: `import foo from 'foo'; export default foo;`,
				foo: `export default 42`,
				bar: `export default 21`
			};
		});

		it('does not resolves id and transforms in the second time', () => {
			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( resolveIdCalls, 2 );
				assert.equal( transformCalls, 2 );
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache: bundle
				});
			}).then( bundle => {
				assert.equal( resolveIdCalls, 3 ); // +1 for entry point which is resolved every time
				assert.equal( transformCalls, 2 );

				return executeBundle( bundle );
			}).then( result => {
				assert.equal( result, 42 );
			});
		});

		it('transforms modified sources', () => {
			let cache;

			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal(transformCalls, 2);

				return executeBundle(bundle).then( result => {
					assert.equal( result, 42 );

					modules.foo = `export default 43`;
					cache = bundle;
				});
			}).then( () => {
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache
				});
			}).then( bundle => {
				assert.equal( transformCalls, 3 );

				return executeBundle( bundle );
			}).then( result => {
				assert.equal( result, 43 );
			});
		});

		it('resolves id of new imports', () => {
			let cache;

			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				assert.equal( resolveIdCalls, 2 );

				return executeBundle( bundle ).then( result => {
					assert.equal( result, 42 );

					modules.entry = `import bar from 'bar'; export default bar;`;
					cache = bundle;
				});
			}).then( () => {
				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache
				});
			}).then( bundle => {
				assert.equal( resolveIdCalls, 4 );

				return executeBundle( bundle );
			}).then( result => {
				assert.equal( result, 21 );
			});
		});

		it( 'keeps ASTs between runs', () => {
			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( bundle => {
				const asts = {};
				bundle.modules.forEach( module => {
					asts[ module.id ] = module.ast;
				});

				assert.deepEqual( asts.entry, acorn.parse( modules.entry, { sourceType: 'module' }) );
				assert.deepEqual( asts.foo, acorn.parse( modules.foo, { sourceType: 'module' }) );
			});
		});

		it( 'recovers from errors', () => {
			modules.entry = `import foo from 'foo'; import bar from 'bar'; export default foo + bar;`;

			return rollup.rollup({
				entry: 'entry',
				plugins: [ plugin ]
			}).then( cache => {
				modules.foo = `var 42 = nope;`;

				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache
				}).catch( err => {
					return cache;
				});
			}).then( cache => {
				modules.foo = `export default 42;`;

				return rollup.rollup({
					entry: 'entry',
					plugins: [ plugin ],
					cache
				}).then( bundle => {
					return executeBundle( bundle );
				}).then( result => {
					assert.equal( result, 63 );
				});
			});
		});

		it( 'separates resolvedIds from resolvedExternalIds', () => {
			modules = {
				entry: `import foo from 'foo'; import external from 'external'; console.log(foo(external));`,
				foo: `export default 42`
			};

			return rollup.rollup({
				entry: 'entry',
				external: ['external'],
				plugins: [ plugin ]
			}).then( bundle => {
				assert.deepEqual(bundle.imports, ['external']);

				assert.equal(bundle.modules[0].id, 'foo');
				assert.equal(bundle.modules[1].id, 'entry');

				assert.deepEqual(bundle.modules[1].resolvedIds, {
					foo: 'foo'
				});

				assert.deepEqual(bundle.modules[1].resolvedExternalIds, {
					external: 'external'
				});
			});
		});
	});

	describe( 'hooks', () => {
		it( 'passes bundle & output object to ongenerate & onwrite hooks', () => {
			const dest = path.join( __dirname, 'tmp/bundle.js' );

			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						ongenerate ( bundle, out ) {
							out.ongenerate = true;
						},

						onwrite (bundle, out ) {
							assert.equal(out.ongenerate, true);
						}
					}
				]
			}).then( bundle => {
				return bundle.write({
					dest,
					format: 'es'
				});
			}).then( () => {
				return sander.unlink( dest );
			});
		});

		it( 'calls ongenerate hooks in sequence', () => {
			const result = [];

			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						ongenerate ( info ) {
							result.push({ a: info.format });
						}
					},
					{
						ongenerate ( info ) {
							result.push({ b: info.format });
						}
					}
				]
			})
				.then( bundle => bundle.generate({ format: 'cjs' }))
				.then( () => {
					assert.deepEqual( result, [
						{ a: 'cjs' },
						{ b: 'cjs' }
					]);
				});
		});

		it( 'calls onwrite hooks in sequence', () => {
			const result = [];
			const dest = path.join( __dirname, 'tmp/bundle.js' );

			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `alert('hello')` }),
					{
						onwrite ( info ) {
							return new Promise( ( fulfil ) => {
								result.push({ a: info.dest, format: info.format });
								fulfil();
							});
						}
					},
					{
						onwrite ( info ) {
							result.push({ b: info.dest, format: info.format });
						}
					}
				]
			}).then( bundle => {
				return bundle.write({
					dest,
					format: 'cjs'
				});
			}).then( () => {
				assert.deepEqual( result, [
					{ a: dest, format: 'cjs' },
					{ b: dest, format: 'cjs' }
				]);

				return sander.unlink( dest );
			});
		});
	});

	describe( 'misc', () => {
		it( 'warns if node builtins are unresolved in a non-CJS, non-ES bundle (#1051)', () => {
			const warnings = [];

			return rollup.rollup({
				entry: 'entry',
				plugins: [
					loader({ entry: `import { format } from 'util';\nexport default format( 'this is a %s', 'formatted string' );` })
				],
				onwarn: warning => warnings.push( warning )
			})
				.then( bundle => bundle.generate({
					format: 'iife',
					moduleName: 'myBundle'
				}))
				.then( () => {
					const relevantWarnings = warnings.filter( warning => warning.code === 'MISSING_NODE_BUILTINS' );
					assert.equal( relevantWarnings.length, 1 );
					assert.equal( relevantWarnings[0].message, `Creating a browser bundle that depends on Node.js built-in module ('util'). You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins` );
				});
		});
	});

	describe( 'rollup.watch', () => {
		beforeEach( () => {
			process.chdir(cwd);
			return sander.rimraf( 'test/_tmp' );
		});

		function run ( file ) {
			const resolved = require.resolve( file );
			delete require.cache[ resolved ];
			return require( resolved );
		}

		function sequence ( watcher, events ) {
			return new Promise( ( fulfil, reject ) => {
				function go ( event ) {
					const next = events.shift();

					if ( !next ) {
						fulfil();
					}

					else if ( typeof next === 'string' ) {
						watcher.once( 'event', event => {
							if ( event.code !== next ) {
								reject( new Error( `Expected ${next} error, got ${event.code}` ) );
							} else {
								go( event );
							}
						});
					}

					else {
						Promise.resolve()
							.then( () => wait( 100 ) ) // gah, this appears to be necessary to fix random errors
							.then( () => next( event ) )
							.then( go )
							.catch( reject );
					}
				}

				go();
			});
		}

		describe( 'fs.watch', () => {
			runTests( false );
		});

		if ( !process.env.CI ) {
			describe( 'chokidar', () => {
				runTests( true );
			});
		}

		function runTests ( chokidar ) {
			it( 'watches a file', () => {
				return sander.copydir( 'test/watch/samples/basic' ).to( 'test/_tmp/input' ).then( () => {
					const watcher = rollup.watch({
						entry: 'test/_tmp/input/main.js',
						dest: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						watch: { chokidar }
					});

					return sequence( watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 42 );
							sander.writeFileSync( 'test/_tmp/input/main.js', 'export default 43;' );
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 43 );
							watcher.close();
						}
					]);
				});
			});

			it( 'recovers from an error', () => {
				return sander.copydir( 'test/watch/samples/basic' ).to( 'test/_tmp/input' ).then( () => {
					const watcher = rollup.watch({
						entry: 'test/_tmp/input/main.js',
						dest: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						watch: { chokidar }
					});

					return sequence( watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 42 );
							sander.writeFileSync( 'test/_tmp/input/main.js', 'export nope;' );
						},
						'START',
						'BUNDLE_START',
						'ERROR',
						'END',
						() => {
							sander.writeFileSync( 'test/_tmp/input/main.js', 'export default 43;' );
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 43 );
							watcher.close();
						}
					]);
				});
			});

			it( 'recovers from an error even when erroring file was "renamed" (#38)', () => {
				return sander.copydir( 'test/watch/samples/basic' ).to( 'test/_tmp/input' ).then( () => {
					const watcher = rollup.watch({
						entry: 'test/_tmp/input/main.js',
						dest: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						watch: { chokidar }
					});

					return sequence( watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 42 );
							sander.unlinkSync( 'test/_tmp/input/main.js' );
							sander.writeFileSync( 'test/_tmp/input/main.js', 'export nope;' );
						},
						'START',
						'BUNDLE_START',
						'ERROR',
						() => {
							sander.unlinkSync( 'test/_tmp/input/main.js' );
							sander.writeFileSync( 'test/_tmp/input/main.js', 'export default 43;' );
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 43 );
							watcher.close();
						}
					]);
				});
			});

			it( 'refuses to watch the output file (#15)', () => {
				return sander.copydir( 'test/watch/samples/basic' ).to( 'test/_tmp/input' ).then( () => {
					const watcher = rollup.watch({
						entry: 'test/_tmp/input/main.js',
						dest: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						watch: { chokidar }
					});

					return sequence( watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 42 );
							sander.writeFileSync( 'test/_tmp/input/main.js', `import '../output/bundle.js'` );
						},
						'START',
						'BUNDLE_START',
						'ERROR',
						event => {
							assert.equal( event.error.message, 'Cannot import the generated bundle' );
							sander.writeFileSync( 'test/_tmp/input/main.js', 'export default 43;' );
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.equal( run( './_tmp/output/bundle.js' ), 43 );
							watcher.close();
						}
					]);
				});
			});

			it( 'ignores files that are not specified in options.watch.include, if given', () => {
				return sander.copydir( 'test/watch/samples/ignored' ).to( 'test/_tmp/input' ).then( () => {
					const watcher = rollup.watch({
						entry: 'test/_tmp/input/main.js',
						dest: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						watch: {
							chokidar,
							include: ['test/_tmp/input/+(main|foo).js']
						}
					});

					return sequence( watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual( run( './_tmp/output/bundle.js' ), { foo: 'foo-1', bar: 'bar-1' });
							sander.writeFileSync( 'test/_tmp/input/foo.js', `export default 'foo-2';` );
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual( run( './_tmp/output/bundle.js' ), { foo: 'foo-2', bar: 'bar-1' });
							sander.writeFileSync( 'test/_tmp/input/bar.js', `export default 'bar-2';` );
						},
						() => {
							assert.deepEqual( run( './_tmp/output/bundle.js' ), { foo: 'foo-2', bar: 'bar-1' });
							watcher.close();
						}
					]);
				});
			});

			it( 'ignores files that are specified in options.watch.exclude, if given', () => {
				return sander.copydir( 'test/watch/samples/ignored' ).to( 'test/_tmp/input' ).then( () => {
					const watcher = rollup.watch({
						entry: 'test/_tmp/input/main.js',
						dest: 'test/_tmp/output/bundle.js',
						format: 'cjs',
						watch: {
							chokidar,
							exclude: ['test/_tmp/input/bar.js']
						}
					});

					return sequence( watcher, [
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual( run( './_tmp/output/bundle.js' ), { foo: 'foo-1', bar: 'bar-1' });
							sander.writeFileSync( 'test/_tmp/input/foo.js', `export default 'foo-2';` );
						},
						'START',
						'BUNDLE_START',
						'BUNDLE_END',
						'END',
						() => {
							assert.deepEqual( run( './_tmp/output/bundle.js' ), { foo: 'foo-2', bar: 'bar-1' });
							sander.writeFileSync( 'test/_tmp/input/bar.js', `export default 'bar-2';` );
						},
						() => {
							assert.deepEqual( run( './_tmp/output/bundle.js' ), { foo: 'foo-2', bar: 'bar-1' });
							watcher.close();
						}
					]);
				});
			});
		}
	});

});
