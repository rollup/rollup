const fs = require('fs');
const path = require('path');
const assert = require('assert');
const getLocation = require('../../getLocation');
const { SourceMapConsumer } = require('source-map');

module.exports = {
	description: 'generates correct sourcemap with reified namespace (#668)',
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		const main = fs.readFileSync(path.join(__dirname, 'main.js'), 'utf-8');
		const generatedLoc = getLocation(code, 'deepEqual');

		const actual = smc.originalPositionFor(generatedLoc);
		const expected = getLocation(main, 'deepEqual');

		assert.equal(actual.line, expected.line);
		assert.equal(actual.column, expected.column);
		assert.equal(actual.source, '../main.js');
	}
};
