const assert = require('node:assert');
const rollup = require('../../dist/rollup');
const { loader, compareError } = require('../testHelpers.js');

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
		let parameters;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: `eval(42);` })],
			onwarn(warning, onwarn) {
				parameters = [warning, onwarn];
			}
		});
		await bundle.generate({ format: 'es' });
		assert.equal(parameters[0].code, 'EVAL');
		assert.equal(
			parameters[0].message,
			'x (1:0): Use of eval in "x" is strongly discouraged as it poses security risks and may cause issues with minification.'
		);
		assert.equal(typeof parameters[1], 'function');
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
			'Invalid value "vanilla" for option "output.format" - Valid values are "amd", "cjs", "system", "es", "iife" or "umd".'
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

	it('reuses existing error object', async () => {
		class CustomError extends Error {
			constructor(message, x) {
				super(message);
				this.prop = x.toUpperCase();
			}
		}

		let error = null;
		const customError = new CustomError('foo', 'bar');
		try {
			await rollup.rollup({
				input: 'x',
				plugins: [
					loader({ x: `console.log( 42 );` }),
					{
						transform() {
							this.error(customError);
						}
					}
				]
			});
		} catch (buildError) {
			error = buildError;
		}
		assert.strictEqual(error, customError);
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
			'Invalid value for option "output.file" - when building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option.'
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
			'Invalid value for option "output.file" - when building multiple chunks, the "output.dir" option must be used, not "output.file". To inline dynamic imports, set the "inlineDynamicImports" option.'
		);
	});

	it('does not throw when using dynamic imports with the "file" option and "inlineDynamicImports"', async () => {
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: 'console.log( "x" );import("y");', y: 'console.log( "y" );' })]
		});
		await bundle.generate({
			file: 'x',
			format: 'es',
			inlineDynamicImports: true
		});
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
			'Invalid value for option "output.file" - you must set "output.dir" instead of "output.file" when providing named inputs.'
		);
	});

	it('throws when using preserveModules together with the "file" option', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: 'console.log( "x" );' })]
		});
		try {
			await bundle.generate({ file: 'x', format: 'es', preserveModules: true });
		} catch (generateError) {
			error = generateError;
		}
		assert.strictEqual(
			error && error.message,
			'Invalid value for option "output.file" - you must set "output.dir" instead of "output.file" when using the "output.preserveModules" option.'
		);
	});

	it('prevents generating and writing from a closed bundle', async () => {
		let error = null;
		const bundle = await rollup.rollup({
			input: 'x',
			plugins: [loader({ x: 'console.log( "x" );' })]
		});
		bundle.close();
		// Can be safely called multiple times
		bundle.close();

		try {
			await bundle.generate({ file: 'x', format: 'es' });
		} catch (generateError) {
			error = generateError;
		}
		compareError(error, {
			code: 'ALREADY_CLOSED',
			message: 'Bundle is already closed, no more calls to "generate" or "write" are allowed.'
		});
		error = null;

		try {
			await bundle.write({ file: 'x', format: 'es' });
		} catch (writeError) {
			error = writeError;
		}
		compareError(error, {
			code: 'ALREADY_CLOSED',
			message: 'Bundle is already closed, no more calls to "generate" or "write" are allowed.'
		});
		error = null;
	});

	it('triggers a warning when using output.amd.id together with the "dir" option', async () => {
		let warning = null;
		const bundle = await rollup.rollup({
			input: 'input',
			plugins: [loader({ input: `import('dep')`, dep: `console.log('dep')` })],
			onwarn: w => (warning = w)
		});
		await bundle.generate({
			dir: 'x',
			format: 'amd',
			amd: {
				id: 'something'
			}
		});

		assert.strictEqual(
			warning && warning.message,
			'Invalid value for option "output.amd.id" - this option is only properly supported for single-file builds. Use "output.amd.autoId" and "output.amd.basePath" instead.'
		);
	});
});
