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
				assert.equal(err.message, 'You must supply an options object to rollup');
			});
	});

	it('node API passes warning and default handler to custom onwarn function', () => {
		let args;
		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: `console.log( 42 );` }), { ongenerate() {} }],
				onwarn(warning, onwarn) {
					args = [warning, onwarn];
				}
			})
			.then(bundle => {
				return bundle.generate({ format: 'es' });
			})
			.then(() => {
				assert.equal(args[0].code, 'DEPRECATED_FEATURE');
				assert.equal(
					args[0].message,
					'The ongenerate hook used by plugin at position 2 is deprecated. The generateBundle hook should be used instead.'
				);
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
			.rollup({ input: 'x', onwarn, plUgins: [], plugins: [loader({ x: `console.log( 42 );` })] })
			.then(() => {
				assert.deepEqual(warnings, [
					{
						code: 'UNKNOWN_OPTION',
						message:
							'Unknown input option: plUgins. Allowed options: ' + require('./optionList').input
					}
				]);
			});
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
			.then(({ output: [{ code }] }) => {
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
				}, /You must specify "output\.format", which can be one of "amd", "cjs", "system", "esm", "iife" or "umd"./);
			});
	});

	it('reuses existing error object', () => {
		let error;

		class CustomError extends Error {
			constructor(message, x) {
				super(message);
				this.prop = x.toUpperCase();
			}
		}

		return rollup
			.rollup({
				input: 'x',
				plugins: [
					loader({ x: `console.log( 42 );` }),
					{
						transform(code) {
							error = new CustomError('foo', 'bar');
							this.error(error);
						}
					}
				]
			})
			.catch(e => {
				assert.equal(e, error);
			});
	});

	it('throws when using multiple inputs together with the "file" option', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: ['x', 'y'],
				plugins: [loader({ x: 'console.log( "x" );', y: 'console.log( "y" );' })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate({ file: 'x', format: 'es' });
				}, /You must set "output\.dir" instead of "output\.file" when generating multiple chunks\./);
			});
	});

	it('does not throw when using a single element array of inputs together with the "file" option', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: ['x'],
				plugins: [loader({ x: 'console.log( "x" );' })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => bundle.generate({ file: 'x', format: 'es' }));
	});

	it('throws when using dynamic imports with the "file" option', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'x',
				plugins: [loader({ x: 'console.log( "x" );import("y");', y: 'console.log( "y" );' })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate({ file: 'x', format: 'es' });
				}, /You must set "output\.dir" instead of "output\.file" when generating multiple chunks\./);
			});
	});

	it('does not throw when using dynamic imports with the "file" option and "inlineDynamicImports"', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'x',
				inlineDynamicImports: true,
				plugins: [loader({ x: 'console.log( "x" );import("y");', y: 'console.log( "y" );' })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => bundle.generate({ file: 'x', format: 'es' }));
	});

	it('throws when using the object form of "input" together with the "file" option', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: { main: 'x' },
				plugins: [loader({ x: 'console.log( "x" );' })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate({ file: 'x', format: 'es' });
				}, /You must set "output\.dir" instead of "output\.file" when providing named inputs\./);
			});
	});

	it('throws when using preserveModules together with the "file" option', () => {
		const warnings = [];

		return rollup
			.rollup({
				input: 'x',
				preserveModules: true,
				plugins: [loader({ x: 'console.log( "x" );' })],
				onwarn: warning => warnings.push(warning)
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.generate({ file: 'x', format: 'es' });
				}, /You must set "output\.dir" instead of "output\.file" when using the "preserveModules" option\./);
			});
	});
});
