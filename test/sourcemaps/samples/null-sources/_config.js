const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'treats mappings to a null source as unmapped',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load(id) {
					return {
						code: readFileSync(id, 'utf8'),
						/** @type {any} */
						map: {
							version: 3,
							names: [],
							// The first line maps to a source whose name is not known
							sources: [null, 'original.js'],
							sourcesContent: [null, 'console.log(2);'],
							mappings: 'AAAA;ACAA'
						}
					};
				}
			}
		]
	},
	async test(code, map) {
		assert.deepStrictEqual(map.sources, ['../original.js']);
		const smc = await new SourceMapConsumer(map);

		const unknownLoc = smc.originalPositionFor(getLocation(code, code.indexOf('log(1)')));
		assert.strictEqual(unknownLoc.source, null);

		const originalLoc = smc.originalPositionFor(getLocation(code, code.indexOf('log(2)')));
		assert.strictEqual(originalLoc.source, '../original.js');
		assert.strictEqual(originalLoc.line, 1);
	}
});
