const assert = require('node:assert/strict');
const { readFileSync, unlinkSync } = require('node:fs');

module.exports = defineTest({
	command: 'rollup --input - --file - < main.js',
	description: 'consumes bare dashes as values for long input and file options',
	test() {
		const output = readFileSync('-', 'utf8');
		unlinkSync('-');
		assert.equal(output.trim(), "console.log('PASS');");
	}
});
