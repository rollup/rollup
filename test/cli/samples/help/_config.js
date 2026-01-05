const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const assert = require('node:assert');

module.exports = defineTest({
	description: 'displays the help text',
	spawnArgs: ['--help'],
	result(stdout) {
		const [firstLine, ...restLines] = stdout.trim().split('\n');
		assert.match(firstLine, /^rollup version \d+\.\d+\.\d+(-\d+)?$/);
		const expected = readFileSync(join(__dirname, '_expected'), 'utf8');
		assert.equal([...restLines].join('\n'), expected.trim());
	}
});
