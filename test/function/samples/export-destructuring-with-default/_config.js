const assert = require('node:assert');

module.exports = defineTest({
	description:
		'exported destructuring declarations with default values produce valid output and stay live',
	exports(exports) {
		assert.equal(exports.retries, 3);
		assert.equal(exports.timeout, 1000);
		assert.equal(exports.first, 1);
		assert.equal(exports.renamedValue, 2);
		assert.equal(exports.deep, 3);
		assert.equal(exports.plain, 4);
		assert.equal(exports.computed, 5);
		assert.deepEqual(exports.rest, [6, 7, 8]);
		assert.equal(exports.reassigned, 5);
		exports.bumpReassigned();
		assert.equal(exports.reassigned, 6);
		exports.setReassigned(7);
		assert.equal(exports.reassigned, 7);
		assert.equal(exports.counter, 0);
		exports.incrementCounter();
		assert.equal(exports.counter, 1);
		assert.equal(exports.looped, 0);
		exports.loop();
		assert.equal(exports.looped, 2);
		exports.resetRest();
		assert.deepEqual(exports.rest, []);
	}
});
