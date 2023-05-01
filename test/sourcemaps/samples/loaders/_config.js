const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const buble = require('buble');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'preserves sourcemap chains when transforming',
	options: {
		plugins: [
			{
				load(id) {
					if (/foo.js$/.test(id)) {
						id = id.replace(/foo.js$/, 'bar.js');
					} else if (/bar.js$/.test(id)) {
						id = id.replace(/bar.js$/, 'foo.js');
					}

					const code = readFileSync(id, 'utf8');

					const out = buble.transform(code, {
						transforms: { modules: false },
						sourceMap: true,
						source: id
					});

					if (!/main.js$/.test(id)) {
						const slash = out.map.sources[0].lastIndexOf('/') + 1;
						out.map.sources = out.map.sources.map(source => '../' + source.slice(slash));
						out.map.sourceRoot = 'fake';
					}

					return { code: out.code, map: out.map };
				}
			}
		]
	},
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);
		let generatedLoc;
		let originalLoc;

		generatedLoc = getLocation(code, code.indexOf('22'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.source, '../foo.js');
		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 32);

		generatedLoc = getLocation(code, code.indexOf('20'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.source, '../bar.js');
		assert.equal(originalLoc.line, 1);
		assert.equal(originalLoc.column, 37);

		generatedLoc = getLocation(code, code.indexOf('log'));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.source, '../main.js');
		assert.ok(/columns/.test(smc.sourceContentFor('../main.js')));
		assert.equal(originalLoc.line, 4);
		assert.equal(originalLoc.column, 19);
	}
});
