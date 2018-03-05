var assert = require('assert');

module.exports = {
	description: 'allows export { x as y } from ...',
	exports: function(exports) {
		assert.equal(exports.y, 42);
		assert.ok(!('x' in exports));
	}
};
