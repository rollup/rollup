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

	it('fails without options', async () => {
		let error = null;
		try {
			await rollup.rollup();
		} catch (buildError) {
			error = buildError;
		}
		assert.strictEqual(error && error.message, 'You must supply an options object to rollup');
	});

	it('node API passes warning and default handler to custom onwarn function', async () => {
		let args;
		await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `eval(42);` })],
			onwarn(warning, onwarn) {
				args = [warning, onwarn];
			}
		});
		assert.equal(args[0].code, 'EVAL');
		assert.equal(
			args[0].message,
			'Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification'
		);
		assert.equal(typeof args[1], 'function');
	});

	it('fails without options.input', async () => {
		let error = null;
		try {
			await rollup.rollup({});
		} catch (buildError) {
			error = buildError;
		}
		assert.strictEqual(error && error.message, 'You must supply options.input to rollup');
	});

	it('includes a newline at the end of the bundle', async () => {
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` })]
		});
		const {
			output: [{ code }]
		} = await bundle.generate({ format: 'iife' });
		assert.ok(code[code.length - 1] === '\n');
	});

	it('throws on missing output options when generating a bundle', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` })]
		});
		try {
			await bundle.generate();
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(error && error.message, 'You must supply an options object');
	});

	it('throws on missing output options when writing a bundle', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` })]
		});
		try {
			await bundle.write();
		} catch (writeError) {
			error = writeError;
		}
		assert.strictEqual(error && error.message, 'You must supply an options object');
		try {
			await bundle.write({ format: 'es' });
		} catch (writeError) {
			error = writeError;
		}
		assert.strictEqual(
			error && error.message,
			'You must specify "output.file" or "output.dir" for the build.'
		);
	});


	it('throws on incorrect bundle.generate format option', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `console.log( 42 );` })]
		});
		try {
			await bundle.generate({ file: 'x', format: 'vanilla' });
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(
			error && error.message,
			'You must specify "output.format", which can be one of "amd", "cjs", "system", "es", "iife" or "umd".'
		);
	});

	it('defaults to output format `es` if not specified', async () => {
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `export function foo(x){ console.log(x); }` })]
		});
		const {
			output: [{ code }]
		} = await bundle.generate({});
		assert.equal(code, `function foo(x){ console.log(x); }\n\nexport { foo };\n`);
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

	it('throws when using multiple inputs together with the "file" option', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: ['x', 'y'],
			plugins: [loader({ x: 'console.log( "x" );', y: 'console.log( "y" );' })]
		});
		try {
			await bundle.generate({ file: 'x', format: 'es' });
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(
			error && error.message,
			'When building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option.'
		);
	});

	it('does not throw when using a single element array of inputs together with the "file" option', async () => {
		const bundle = await rollup.rollup({
			input: ['x'],
			plugins: [loader({ x: 'console.log( "x" );' })]
		});
		await bundle.generate({ file: 'x', format: 'es' });
	});

	it('throws when using dynamic imports with the "file" option', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: 'console.log( "x" );import("y");', y: 'console.log( "y" );' })]
		});
		try {
			await bundle.generate({ file: 'x', format: 'es' });
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(
			error && error.message,
			'When building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option.'
		);
	});

	it('does not throw when using dynamic imports with the "file" option and "inlineDynamicImports"', async () => {
		const bundle = await rollup.rollup({
			input: 'x',
			inlineDynamicImports: true,
			plugins: [loader({ x: 'console.log( "x" );import("y");', y: 'console.log( "y" );' })]
		});
		await bundle.generate({ file: 'x', format: 'es' });
	});

	it('throws when using the object form of "input" together with the "file" option', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: { main: 'x' },
			plugins: [loader({ x: 'console.log( "x" );' })]
		});
		try {
			await bundle.generate({ file: 'x', format: 'es' });
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(
			error && error.message,
			'You must set "output.dir" instead of "output.file" when providing named inputs.'
		);
	});

	it('throws when using preserveModules together with the "file" option', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			preserveModules: true,
			plugins: [loader({ x: 'console.log( "x" );' })]
		});
		try {
			await bundle.generate({ file: 'x', format: 'es' });
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(
			error && error.message,
			'You must set "output.dir" instead of "output.file" when using the "preserveModules" option.'
		);
	});
});
