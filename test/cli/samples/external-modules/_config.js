const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'allows external modules to be specified with --external=foo,bar,baz',
	command: 'rollup main.js --format cjs --external=path,util',
	execute: true,
	stderr(stderr) {
		assert.ok(!stderr.includes('(!)'));
	}
});
