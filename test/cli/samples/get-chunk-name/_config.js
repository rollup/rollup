const assert = require('node:assert');
module.exports = defineTest({
	description: 'get right chunk name for preserve modules',
	spawnArgs: ['-c'],
	result(code) {
		assert.ok(
			code.includes(`//→ ${__dirname.replace(/^(\/|[a-zA-Z]:\\)/, '').replace(/\\/g, '/')}/main.js`)
		);
		assert.ok(code.includes(`//→ sub.js`));
	}
});
