const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'keeps the names and shared sources of index sourcemap sections',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				load(id) {
					return {
						code: readFileSync(id, 'utf8'),
						map: {
							version: 3,
							sections: [
								{
									offset: { line: 0, column: 0 },
									map: {
										version: 3,
										names: ['first'],
										sources: ['a.js'],
										sourcesContent: ['first();\nsecond();'],
										mappings: 'AAAAA'
									}
								},
								{
									offset: { line: 1, column: 0 },
									map: {
										version: 3,
										names: ['second'],
										sources: ['a.js'],
										sourcesContent: ['first();\nsecond();'],
										mappings: 'AACAA'
									}
								},
								{
									offset: { line: 2, column: 0 },
									map: { version: 3, sourceRoot: 'lib/', sources: ['b.js'], mappings: 'AAAA' }
								}
							]
						}
					};
				},
				transform() {
					const { names, sources } = this.getCombinedSourcemap();
					assert.deepStrictEqual(sources, ['a.js', 'lib/b.js']);
					assert.deepStrictEqual(names, ['first', 'second']);
					return null;
				}
			}
		]
	},
	async test(code, map) {
		assert.deepStrictEqual(map.sources, ['../a.js', '../lib/b.js']);
		assert.deepStrictEqual(map.sourcesContent, ['first();\nsecond();', null]);
		const smc = await new SourceMapConsumer(map);

		for (const [token, source, line, name] of [
			['log(1)', '../a.js', 1, 'first'],
			['log(2)', '../a.js', 2, 'second'],
			['log(3)', '../lib/b.js', 1, null]
		]) {
			const originalLoc = smc.originalPositionFor(getLocation(code, code.indexOf(token)));
			assert.strictEqual(originalLoc.source, source, token);
			assert.strictEqual(originalLoc.line, line, token);
			assert.strictEqual(originalLoc.name, name, token);
		}
	}
});
