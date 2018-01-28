const assert = require('assert');
const rollup = require('../../dist/rollup');
const { executeBundle, loader } = require('../utils.js');

describe('sanity checks', () => {
	it('exists', () => {
		assert.ok(!!rollup);
	});

	it('has a rollup method', () => {
		assert.equal(typeof rollup.rollup, 'function');
	});

	it('fails without options', () => {
		return rollup
			.rollup()
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(err => {
				assert.equal(err.message, 'You must supply an options object to rollup');
			});
	});

	it('node API passes warning and default handler to custom onwarn function', () => {
		let args = [];
		return rollup
			.rollup({
				entry: 'x',
				plugins: [loader({ x: `console.log( 42 );` })],
				onwarn(warning, onwarn) {
					args = [warning, onwarn];
				}
			})
			.then(() => {
				assert.deepEqual(args[0], {
					code: 'DEPRECATED_OPTIONS',
					deprecations: [
						{
							new: 'input',
							old: 'entry'
						}
					],
					message: `The following options have been renamed — please update your config: entry -> input`
				});
				assert.equal(typeof args[1], 'function');
			});
	});

	it('fails without options.input', () => {
		return rollup
			.rollup({})
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(err => {
				assert.equal(err.message, 'You must supply options.input to rollup');
			});
	});

	it('fails with invalid keys', () => {
		const warnings = [];
		const onwarn = warning => warnings.push(warning);
		return rollup
			.rollup({
				input: 'x',
				onwarn,
				plUgins: [],
				plugins: [loader({ x: `console.log( 42 );` })]
			})
			.then(() => {
				assert.deepEqual(warnings, [
					{
						code: 'UNKNOWN_OPTION',
						message: 'Unknown option found: plUgins. Allowed keys: input, legacy, treeshake, acorn, acornInjectPlugins, context, moduleContext, plugins, onwarn, watch, cache, preferConst, experimentalDynamicImport, experimentalCodeSplitting, preserveSymlinks, experimentalPreserveModules, entry, external, extend, amd, banner, footer, intro, format, outro, sourcemap, sourcemapFile, name, globals, interop, legacy, freeze, indent, strict, noConflict, paths, exports, file, dir, pureExternalModules'
					}]
				);
			}
		);
	});

	it('treats Literals as leaf nodes, even if first literal encountered is null', () => {
		// this test has to be up here, otherwise the bug doesn't have
		// an opportunity to present itself
		return rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `var a = null; a = 'a string';` })]
		});
	});

	it('includes a newline at the end of the bundle', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `console.log( 42 );` })]
			})
			.then(bundle => {
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				assert.ok(code[code.length - 1] === '\n');
			});
	});

	it('throws on missing output options', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `console.log( 42 );` })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate();
				}, /You must supply an options object/);
			});
	});

	it('throws on missing format option', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `console.log( 42 );` })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate({ file: 'x' });
				}, /You must specify options\.format, which can be one of 'amd', 'cjs', 'system', 'es', 'iife' or 'umd'/);
			});
	});
});

describe('deprecations', () => {
	it('warns on options.entry, but handles', () => {
		const warnings = [];
		return rollup
			.rollup({
				entry: 'x',
				plugins: [loader({ x: `export default 42` })],
				onwarn: warning => {
					warnings.push(warning);
				}
			})
			.then(executeBundle)
			.then(result => {
				assert.equal(result, 42);
				assert.deepEqual(warnings, [
					{
						code: 'DEPRECATED_OPTIONS',
						deprecations: [
							{
								new: 'input',
								old: 'entry'
							}
						],
						message: `The following options have been renamed — please update your config: entry -> input`
					}
				]);
			});
	});

	it('adds deprecations correctly for rollup', () => {
		const warnings = [];
		return rollup
			.rollup({
				entry: 'x',
				format: 'cjs',
				indent: true,
				sourceMap: true,
				plugins: [loader({ x: `export default 42` })],
				onwarn: warning => {
					warnings.push(warning);
				}
			})
			.then(executeBundle)
			.then(result => {
				assert.equal(result, 42);
				const deprecations = warnings[0].deprecations;
				assert.equal(deprecations.length, 4);
				assert.deepEqual(deprecations, [
					{ new: 'input', old: 'entry' },
					{ new: 'output.indent', old: 'indent' },
					{ new: 'output.sourcemap', old: 'sourceMap' },
					{ new: 'output.format', old: 'format' }
				]);
			});
	});

	it('throws a useful error on accessing code/map properties of bundle.generate promise', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `console.log( 42 );` })]
			})
			.then(bundle => {
				let errored = false;

				try {
					const { code, map } = bundle.generate({ format: 'es' });
					console.log(code, map);
				} catch (err) {
					assert.equal(
						err.message,
						`bundle.generate(...) now returns a Promise instead of a { code, map } object`
					);
					errored = true;
				}

				assert.ok(errored);
			});
	});
});

describe('bundle.write()', () => {
	it('fails without options or options.file', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [
					{
						resolveId: () => {
							return 'test';
						},
						load: () => {
							return '// empty';
						}
					}
				]
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.write();
				}, /You must specify output\.file/);

				assert.throws(() => {
					bundle.write({});
				}, /You must specify output\.file/);
			});
	});

	it('expects output.name for IIFE and UMD bundles', () => {
		let bundle;

		return rollup
			.rollup({
				input: 'x',
				plugins: [
					{
						resolveId: () => {
							return 'test';
						},
						load: () => {
							return 'export var foo = 42;';
						}
					}
				]
			})
			.then(rollupInstance => {
				bundle = rollupInstance;
				return bundle.generate({
					format: 'umd'
				});
			})
			.catch(err => {
				assert.throws(() => {
					throw err;
				}, /You must supply output\.name for UMD bundles/);
			})
			.then(() => {
				return bundle.generate({
					format: 'iife'
				});
			})
			.catch(err => {
				assert.throws(() => {
					throw err;
				}, /You must supply output\.name for IIFE bundles/);
			});
	});

	it('throws on es6 format', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [
					{
						resolveId: () => {
							return 'test';
						},
						load: () => {
							return '// empty';
						}
					}
				]
			})
			.then(bundle => {
				assert.throws(() => {
					return bundle.generate({ format: 'es6' });
				}, /The `es6` output format is deprecated – use `es` instead/);
			});
	});

	it('works when output options is an array', () => {
		const warnings = [];
		const options = {
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` })],
			onwarn: warning => warnings.push(warning),
			output: [
				{
					format: 'cjs'
				},
				{
					format: 'es'
				}
			]
		};
		return rollup.rollup(options).then(bundle => {
			assert.equal(warnings.length, 0, 'No warnings for UNKNOWN');
			assert.throws(() => {
				return Promise.all(options.output.map(o => bundle.write(o)));
			}, /You must specify output\.file/);
		});
	});
});

describe('acorn plugins', () => {
	// Acorn registers plugins globally per process. The tests in this suite
	// use unique plugin names to make sure each plugin is registered in its
	// proper test rather than in a test that ran earlier.

	it('injects plugins passed in acornInjectPlugins', () => {
		let pluginAInjected = false;
		let pluginBInjected = false;

		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `export default 42` })],
				acornInjectPlugins: [
					function pluginA(acorn) {
						pluginAInjected = true;
						return acorn;
					},
					function pluginB(acorn) {
						pluginBInjected = true;
						return acorn;
					}
				]
			})
			.then(executeBundle)
			.then(result => {
				assert.equal(result, 42);
				assert(
					pluginAInjected,
					'A plugin passed via acornInjectPlugins should inject itself into Acorn.'
				);
				assert(
					pluginBInjected,
					'A plugin passed via acornInjectPlugins should inject itself into Acorn.'
				);
			});
	});

	it('injected plugins are registered with Acorn only if acorn.plugins is set', () => {
		let pluginCRegistered = false;
		let pluginDRegistered = false;

		function pluginC(acorn) {
			acorn.plugins.pluginC = () => (pluginCRegistered = true);
			return acorn;
		}

		function pluginD(acorn) {
			acorn.plugins.pluginD = () => (pluginDRegistered = true);
			return acorn;
		}

		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `export default 42` })],
				acorn: {
					plugins: {
						pluginC: true
					}
				},
				acornInjectPlugins: [pluginC, pluginD]
			})
			.then(executeBundle)
			.then(result => {
				assert.equal(result, 42);
				assert.equal(
					pluginCRegistered,
					true,
					'A plugin enabled in acorn.plugins should register with Acorn.'
				);
				assert.equal(
					pluginDRegistered,
					false,
					'A plugin not enabled in acorn.plugins should not register with Acorn.'
				);
			});
	});

	it('throws if acorn.plugins is set and acornInjectPlugins is missing', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `export default 42` })],
				acorn: {
					plugins: {
						pluginE: true
					}
				}
			})
			.then(executeBundle)
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(error => {
				assert.equal(error.message, "Plugin 'pluginE' not found");
			});
	});

	it('throws if acorn.plugins is set and acornInjectPlugins is empty', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `export default 42` })],
				acorn: {
					plugins: {
						pluginF: true
					}
				},
				acornInjectPlugins: []
			})
			.then(executeBundle)
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(error => {
				assert.equal(error.message, "Plugin 'pluginF' not found");
			});
	});
});

describe('misc', () => {
	it('warns if node builtins are unresolved in a non-CJS, non-ES bundle (#1051)', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'input',
				plugins: [
					loader({
						input: `import { format } from 'util';\nexport default format( 'this is a %s', 'formatted string' );`
					})
				],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle =>
				bundle.generate({
					format: 'iife',
					name: 'myBundle'
				})
			)
			.then(() => {
				const relevantWarnings = warnings.filter(
					warning => warning.code === 'MISSING_NODE_BUILTINS'
				);
				assert.equal(relevantWarnings.length, 1);
				assert.equal(
					relevantWarnings[0].message,
					`Creating a browser bundle that depends on Node.js built-in module ('util'). You might need to include https://www.npmjs.com/package/rollup-plugin-node-builtins`
				);
			});
	});
});
