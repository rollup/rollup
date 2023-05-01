const assert = require('node:assert');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = defineTest({
	description: 'basic sourcemap support',
	async test(code, map) {
		assert.equal(map.version, 3);
		assert.ok(/^bundle\.(\w+)\.js/.test(map.file));

		const smc = await new SourceMapConsumer(map);
		let generatedLoc;
		let originalLoc;

		// main.js
		generatedLoc = getLocation(code, code.indexOf("console.log( 'hello from main.js' )"));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.line, 4);
		assert.equal(originalLoc.column, 0);
		assert.equal(originalLoc.source, '../main.js');

		// foo.js
		generatedLoc = getLocation(code, code.indexOf("console.log( 'hello from foo.js' )"));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.line, 2);
		assert.equal(originalLoc.column, 1);
		assert.equal(originalLoc.source, '../foo.js');

		// bar.js
		generatedLoc = getLocation(code, code.indexOf("console.log( 'hello from bar.js' )"));
		originalLoc = smc.originalPositionFor(generatedLoc);

		assert.equal(originalLoc.line, 2);
		assert.equal(originalLoc.column, 1);
		assert.equal(originalLoc.source, '../bar.js');
	}
});
