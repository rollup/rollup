const assert = require('assert');
const terser = require('terser');
const MagicString = require('magic-string');
const getLocation = require('../../../getLocation');
const SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = {
	description: 'names are recovered if transformBundle is used',
	options: {
		strictDeprecations: false,
		plugins: [
			{
				transform(code) {
					const s = new MagicString(code);
					const pattern = /mangleMe/g;
					let match;

					while ((match = pattern.exec(code))) {
						s.overwrite(match.index, match.index + match[0].length, 'mangleMePlease', {
							storeName: true,
							contentOnly: false
						});
					}

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				},
				transformBundle(code) {
					return terser.minify(code, {
						sourceMap: {
							filename: 'x'
						}
					});
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

		let generatedLoc = getLocation(code, /\w+=["']this/.exec(code).index);
		let originalLoc = smc.originalPositionFor(generatedLoc);

		assert.deepEqual(originalLoc, {
			source: '../a.js',
			line: 1,
			column: 4,
			name: 'mangleMe'
		});

		generatedLoc = getLocation(code, /\w+=["']nor/.exec(code).index);
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.deepEqual(originalLoc, {
			source: '../b.js',
			line: 1,
			column: 4,
			name: 'mangleMe'
		});
	}
};
