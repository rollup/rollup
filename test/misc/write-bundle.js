const assert = require('assert');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('bundle.write()', () => {
	it('fails without options or options.file', () => {
		return rollup
			.rollup({
				input: 'x',
				plugins: [
					{
						resolveId: () => 'test',
						load: () => '// empty'
					}
				]
			})
			.then(bundle => {
				assert.throws(() => {
					bundle.write();
				}, /You must supply an options object/);

				assert.throws(() => {
					bundle.write({format: 'esm'});
				}, /You must specify "output\.file"/);
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
				}, /The "es6" output format is deprecated – use "esm" instead/);
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
			}, /You must specify "output\.file"./);
		});
	});
});
