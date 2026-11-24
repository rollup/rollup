const assert = require('node:assert');
const { readFileSync, unlinkSync } = require('node:fs');

module.exports = defineTest({
	description: 'writes output to a file named "-" via "--file -"',
	spawnArgs: ['main.js', '--format', 'es', '--file', '-'],
	test() {
		assert.equal(readFileSync('-', 'utf8').trim(), "console.log('PASS');");
		unlinkSync('-');
	}
});
