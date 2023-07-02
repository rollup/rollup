const assert = require('node:assert');
const path = require('node:path');
const { SourceMapConsumer } = require('source-map');
const rollup = require('../../dist/rollup');
const { loader } = require('../utils.js');

describe('in-memory sourcemaps', () => {
	it('generates an in-memory sourcemap', async () => {
		const bundle = await rollup.rollup({
			input: 'main',
			plugins: [loader({ main: `console.log( 42 );` })]
		});
		const {
			output: [generated]
		} = await bundle.generate({
			format: 'cjs',
			sourcemap: true,
			sourcemapFile: path.resolve('bundle.js')
		});
		const smc = await new SourceMapConsumer(generated.map);
		const locator = (await import('locate-character')).getLocator(generated.code, {
			offsetLine: 1
		});
		const loc = smc.originalPositionFor(locator('42')); // 42
		assert.equal(loc.source, 'main');
		assert.equal(loc.line, 1);
		assert.equal(loc.column, 13);
	});
});
