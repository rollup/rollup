const assert = require('node:assert');
const MagicString = require('magic-string');
const { SourceMapConsumer } = require('source-map');
const terser = require('terser');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'names are recovered if transforms are used',
	options: {
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
				renderChunk(code) {
					return terser.minify(code, {
						sourceMap: {
							filename: 'x'
						}
					});
				}
			}
		]
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

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
});
