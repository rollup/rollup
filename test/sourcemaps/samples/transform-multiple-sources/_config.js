const assert = require('node:assert');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'remaps a sourcemap with multiple sources returned from the transform hook',
	options: {
		output: { name: 'bundle' },
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					return {
						code: 'const foo = 42;\nconst bar = () => 42;\nexport default [foo, bar];\n',
						map: {
							version: 3,
							sources: ['foo.js', 'bar.js'],
							sourcesContent: ['const foo = 42;\n', 'const bar = () => 42;\n'],
							names: [],
							mappings: [[[0, 0, 0, 0]], [[0, 1, 0, 0]], []]
						}
					};
				}
			}
		]
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		assert.ok(
			map.sources.some(source => /foo\.js$/.test(source)),
			'expected the map to include foo.js as a source'
		);
		assert.ok(
			map.sources.some(source => /bar\.js$/.test(source)),
			'expected the map to include bar.js as a source'
		);

		const fooOriginal = smc.originalPositionFor(getLocation(code, code.indexOf('foo')));
		assert.ok(/foo\.js$/.test(fooOriginal.source), 'expected foo to map to foo.js');
		assert.equal(fooOriginal.line, 1);
		assert.equal(fooOriginal.column, 0);

		const barOriginal = smc.originalPositionFor(getLocation(code, code.indexOf('bar')));
		assert.ok(/bar\.js$/.test(barOriginal.source), 'expected bar to map to bar.js');
		assert.equal(barOriginal.line, 1);
		assert.equal(barOriginal.column, 0);
	}
});
