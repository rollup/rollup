const assert = require('assert');
const { readFileSync } = require('fs');
const path = require('path');
const { SourceMapConsumer } = require('source-map');
const getLocation = require('../../getLocation');

module.exports = {
	description: 'generates correct sourcemap with reified namespace (#668)',
	async test(code, map) {
		const smc = await new SourceMapConsumer(map);

		const main = readFileSync(path.join(__dirname, 'main.js'), 'utf-8');
		const generatedLoc = getLocation(code, 'deepEqual');

		const actual = smc.originalPositionFor(generatedLoc);
		const expected = getLocation(main, 'deepEqual');

		assert.equal(actual.line, expected.line);
		assert.equal(actual.column, expected.column);
		assert.equal(actual.source, '../main.js');
	}
};
