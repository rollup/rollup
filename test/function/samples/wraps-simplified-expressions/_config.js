const assert = require('assert');

module.exports = {
	description: 'wraps simplified expressions that have become callees if necessary',
	warnings: warnings => warnings.forEach(warning => assert.equal(warning.code, 'EVAL'))
};
