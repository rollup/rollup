const assert = require('node:assert');

module.exports = defineTest({
	description: 'adds a newline after the sourceMappingURL comment (#756)',
	spawnArgs: ['-i', 'main.js', '-f', 'es', '-m', 'inline'],
	result: code => {
		assert.equal(code.slice(-1), '\n');
	}
});
