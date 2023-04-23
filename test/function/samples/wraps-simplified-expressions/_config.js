const assert = require('node:assert');

module.exports = defineTest({
	description: 'wraps simplified expressions that have become callees if necessary',
	warnings: warnings => {
		for (const warning of warnings) assert.equal(warning.code, 'EVAL');
	}
});
