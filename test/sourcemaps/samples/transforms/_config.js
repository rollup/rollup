const assert = require('node:assert');
const buble = require('buble');
const MagicString = require('magic-string').default;
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				name: 'test-plugin1',
				transform(source) {
					return buble.transform(source, {
						transforms: { modules: false }
					});
				}
			},

			{
				name: 'test-plugin2',
				transform(source) {
					const s = new MagicString(source);
					s.append('\nassert.equal( 1 + 1, 2 );\nassert.equal( 2 + 2, 4 );');

					return {
						code: s.toString(),
						map: s.generateMap({ hires: true })
					};
				}
			}
		]
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		let generatedLoc = getLocation(code, code.indexOf('42'));
		let originalLoc = smc.originalPositionFor(generatedLoc);

		assert.ok(/foo/.test(originalLoc.source));
		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 25);

		generatedLoc = getLocation(code, code.indexOf('log'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.ok(/main/.test(originalLoc.source));
		assert.equal(originalLoc.line, 3);
		assert.equal(originalLoc.column, 8);
	}
});
