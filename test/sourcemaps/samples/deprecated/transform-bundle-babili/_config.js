const babiliResults = require('./babili-results');
const assert = require('assert');
const getLocation = require('../../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = {
	description: 'generates valid sourcemap when source could not be determined via transformBundle',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				transformBundle(code, options) {
					const format = options.format;

					return babiliResults[format];
				}
			}
		],
		output: { indent: false }
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The transformBundle hook used by plugin at position 1 is deprecated. The renderChunk hook should be used instead.',
			plugin: 'at position 1'
		}
	],
	test(code, map) {
		const smc = new SourceMapConsumer(map);

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
};
