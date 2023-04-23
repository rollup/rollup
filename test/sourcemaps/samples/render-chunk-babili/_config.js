const assert = require('node:assert');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');
const babiliResults = require('./babili-results');

module.exports = defineTest({
	description: 'generates valid sourcemap when source could not be determined',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				renderChunk(code, chunk, options) {
					const format = options.format;

					return babiliResults[format];
				}
			}
		],
		output: { indent: false }
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
