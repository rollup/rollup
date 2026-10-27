const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'leaves sources without a name out of the combined sourcemap',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load(id) {
					return {
						code: readFileSync(id, 'utf8'),
						map: {
							version: 3,
							names: [],
							sources: [null, 'original.js'],
							sourcesContent: [null, 'console.log(2);'],
							mappings: 'AAAA;ACAA'
						}
					};
				},
				async transform(code) {
					const combinedMap = this.getCombinedSourcemap();
					assert.deepStrictEqual(combinedMap.sources, [path.join(__dirname, 'original.js')]);
					const smc = await new SourceMapConsumer(combinedMap);

					const unknownLoc = smc.originalPositionFor(getLocation(code, code.indexOf('log(1)')));
					assert.strictEqual(unknownLoc.source, null);

					const originalLoc = smc.originalPositionFor(getLocation(code, code.indexOf('log(2)')));
					assert.strictEqual(originalLoc.source, path.join(__dirname, 'original.js'));
					assert.strictEqual(originalLoc.line, 1);
					return null;
				}
			}
		]
	},
	test(code, map) {
		assert.deepStrictEqual(map.sources, ['../original.js']);
	}
});
