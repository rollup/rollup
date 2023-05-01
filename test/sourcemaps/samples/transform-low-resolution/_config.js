const assert = require('node:assert');
const { encode } = require('@jridgewell/sourcemap-codec');
const MagicString = require('magic-string').default;
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'handles combining low-resolution and high-resolution source-maps when transforming',
	options: {
		output: { name: 'bundle' },
		plugins: [
			{
				name: 'test-plugin1',
				transform(code) {
					// each entry of each line consist of
					// [generatedColumn, sourceIndex, sourceLine, sourceColumn];
					// this mapping only maps the second line to the first with no column
					// details
					/** @type {import('@jridgewell/sourcemap-codec').SourceMapMappings} */
					const decodedMap = [[], [[0, 0, 0, 0]]];
					return {
						code: `console.log('added');\n${code}`,
						/** @type {any} */
						map: { mappings: encode(decodedMap) }
					};
				}
			},
			{
				name: 'test-plugin2',
				transform(code) {
					const s = new MagicString(code);
					s.prepend("console.log('second');\n");

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

		const generatedLoc = getLocation(code, code.indexOf("'baz'"));
		const originalLoc = smc.originalPositionFor(generatedLoc);

		assert.strictEqual(originalLoc.line, 1);
		assert.strictEqual(originalLoc.column, 0);
	}
});
