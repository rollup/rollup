const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

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
				assert.equal(
					err.message,
					'You must supply an options object to rollup'
				);
			});
	});

	it('fails without options.entry', () => {
		return rollup
			.rollup({})
			.then(() => {
				throw new Error('Missing expected error');
			})
			.catch(err => {
				assert.equal(err.message, 'You must supply options.entry to rollup');
			});
	});

	it('fails with invalid keys', () => {
		return rollup.rollup({ entry: 'x', plUgins: [] }).then(
			() => {
				throw new Error('Missing expected error');
			},
			err => {
				assert.equal(
					err.message,
					"Unexpected key 'plUgins' found, expected one of: acorn, amd, banner, cache, context, dest, entry, exports, extend, external, footer, format, globals, indent, interop, intro, legacy, moduleContext, moduleName, noConflict, onwarn, outro, paths, plugins, preferConst, pureExternalModules, sourceMap, sourceMapFile, targets, treeshake, useStrict, watch"
				);
			}
		);
	});

	it('treats Literals as leaf nodes, even if first literal encountered is null', () => {
		// this test has to be up here, otherwise the bug doesn't have
		// an opportunity to present itself
		return rollup.rollup({
			entry: 'x',
			plugins: [loader({ x: `var a = null; a = 'a string';` })]
		});
	});

	it('includes a newline at the end of the bundle', () => {
		return rollup
			.rollup({
				entry: 'x',
				plugins: [loader({ x: `console.log( 42 );` })]
			})
			.then(bundle => {
				return bundle.generate({ format: 'iife' });
			})
			.then(({ code }) => {
				assert.ok(code[code.length - 1] === '\n');
			});
	});

	it('throws on missing format option', () => {
		const warnings = [];

		return rollup
			.rollup({
				entry: 'x',
				plugins: [loader({ x: `console.log( 42 );` })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate();
				}, /You must supply an output format/);
			});
	});
});

describe('deprecations', () => {
	it('throws a useful error on accessing code/map properties of bundle.generate promise', () => {
		return rollup
			.rollup({
				entry: 'x',
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
	it('fails without options or options.dest', () => {
		return rollup
			.rollup({
				entry: 'x',
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
				}, /must supply options\.dest/);

				assert.throws(() => {
					bundle.write({});
				}, /must supply options\.dest/);
			});
	});

	it('expects options.moduleName for IIFE and UMD bundles', () => {
		let bundle;

		return rollup
			.rollup({
				entry: 'x',
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
				}, /You must supply options\.moduleName for UMD bundles/);
			})
			.then(() => {
				return bundle.generate({
					format: 'iife'
				});
			})
			.catch(err => {
				assert.throws(() => {
					throw err;
				}, /You must supply options\.moduleName for IIFE bundles/);
			});
	});

	it('throws on es6 format', () => {
		return rollup
			.rollup({
				entry: 'x',
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
});

describe('misc', () => {
	it('warns if node builtins are unresolved in a non-CJS, non-ES bundle (#1051)', () => {
		const warnings = [];

		return rollup
			.rollup({
				entry: 'entry',
				plugins: [
					loader({
						entry: `import { format } from 'util';\nexport default format( 'this is a %s', 'formatted string' );`
					})
				],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle =>
				bundle.generate({
					format: 'iife',
					moduleName: 'myBundle'
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
