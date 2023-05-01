const assert = require('node:assert');
const { SourceMapConsumer } = require('source-map');
const terser = require('terser');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				renderChunk(code) {
					const options = {
						sourceMap: {
							filename: 'x' // trigger sourcemap generation
						}
					};

					return terser.minify(code, options);
				}
			}
		]
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		let generatedLoc = getLocation(code, code.indexOf('42'));
		let originalLoc = smc.originalPositionFor(generatedLoc);

		assert.ok(/main/.test(originalLoc.source));
		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 13);

		generatedLoc = getLocation(code, code.indexOf('log'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 8);
	}
});
