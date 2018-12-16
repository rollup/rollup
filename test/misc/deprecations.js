const assert = require('assert');
const rollup = require('../../dist/rollup');
const { executeBundle, loader } = require('../utils.js');

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

	it('supports esm format alias', () => {
		return rollup
			.rollup({ input: 'x', plugins: [loader({ x: 'export const x = function () {}' })] })
			.then(bundle => bundle.generate({ format: 'esm' }))
			.then(({ code }) => {
				assert.equal(code, 'const x = function () {};\n\nexport { x };\n');
			});
	});
});
