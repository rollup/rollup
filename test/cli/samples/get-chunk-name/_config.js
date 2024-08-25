const assert = require('node:assert');
module.exports = defineTest({
	description: 'get right chunk name for preserve modules',
	command: 'rollup -c',
	result(code) {
		assert.ok(code.includes(`//→ ${__dirname.replace(/\//, '')}/main.js`));
		assert.ok(code.includes(`//→ sub.js`));
	}
});
