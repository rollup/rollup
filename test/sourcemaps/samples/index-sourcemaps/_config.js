const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'supports index sourcemaps with sections',
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
							sections: [
								{
									offset: { line: 0, column: 0 },
									map: { version: 3, sources: ['a.js'], mappings: 'AAAA' }
								},
								{
									offset: { line: 0, column: 15 },
									map: {
										version: 3,
										names: [],
										sourceRoot: 'lib',
										sources: ['b.js'],
										mappings: 'AAAA,QAAQ;AACR,eAAe'
									}
								},
								{
									// only provides the content of a.js
									offset: { line: 2, column: 0 },
									map: {
										version: 3,
										names: [],
										sources: ['a.js'],
										sourcesContent: ['console.log(1);'],
										mappings: 'A'
									}
								}
							]
						}
					};
				},
				transform(code, id) {
					return {
						code,
						/** @type {any} */
						map: {
							version: 3,
							sections: [
								{
									offset: { line: 0, column: 0 },
									map: {
										version: 3,
										names: [],
										sources: [id],
										sourcesContent: [code],
										mappings: 'AAAA,eAAe'
									}
								},
								{
									offset: { line: 1, column: 0 },
									map: { version: 3, names: [], sources: [id], mappings: 'AACA,eAAe' }
								}
							]
						}
					};
				}
			}
		]
	},
	async test(code, map) {
		assert.deepStrictEqual(map.sources, ['../a.js', '../lib/b.js']);
		assert.deepStrictEqual(map.sourcesContent, ['console.log(1);', null]);
		const smc = await new SourceMapConsumer(map);

		for (const [token, source, line, column] of [
			['log(1)', '../a.js', 1, 0],
			['log(2)', '../lib/b.js', 1, 0],
			['log(3)', '../lib/b.js', 2, 0],
			['log(4)', '../lib/b.js', 2, 15]
		]) {
			const originalLoc = smc.originalPositionFor(getLocation(code, code.indexOf(token)));
			assert.strictEqual(originalLoc.source, source, token);
			assert.strictEqual(originalLoc.line, line, token);
			assert.strictEqual(originalLoc.column, column, token);
		}
	}
});
