const assert = require('assert');
const MagicString = require('magic-string');
const { SourceMapConsumer } = require('source-map');
const { encode } = require('sourcemap-codec');
const getLocation = require('../../getLocation');

module.exports = {
	description: 'handles combining low-resolution and high-resolution source-maps when transforming',
	options: {
		output: { name: 'bundle' },
		plugins: [
			{
				transform(code) {
					// each entry of each line consist of
					// [generatedColumn, sourceIndex, sourceLine, sourceColumn];
					// this mapping only maps the second line to the first with no column
					// details
					const decodedMap = [[], [[0, 0, 0, 0]]];
					return {
						code: `console.log('added');\n${code}`,
						map: { mappings: encode(decodedMap) }
					};
				}
			},
			{
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
};
