const terser = require('terser');
const assert = require('assert');
const getLocation = require('../../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = {
	description: 'preserves sourcemap chains when transforming the bundle',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				transformBundle(code) {
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
