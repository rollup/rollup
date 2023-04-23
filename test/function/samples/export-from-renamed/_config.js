const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'allows export { x as y } from ...',
	exports(exports) {
		assert.equal(exports.y, 42);
		assert.ok(!('x' in exports));
	}
});
