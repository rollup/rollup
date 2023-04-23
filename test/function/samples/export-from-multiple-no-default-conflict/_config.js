const assert = require('node:assert');

module.exports = defineTest({
	description: 'export from does not cause erroneous warning if multiple modules export default',
	warnings: [],
	exports: exports => {
		assert.deepEqual(exports, {
			foo: 'foo',
			bar: 'bar'
		});
	}
});
