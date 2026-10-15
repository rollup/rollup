const assert = require('node:assert/strict');

module.exports = defineTest({
	description: 'keeps all aliases of reassigned exports live',
	exports(exports) {
		const assertAliases = expected => {
			for (const name of ['value', 'alias', 'spaced alias', '__proto__']) {
				assert.equal(exports[name], expected);
				assert.ok(Object.keys(exports).includes(name));
			}
		};
		assertAliases(3);
		exports.set(4);
		assertAliases(4);
		assert.equal(exports.increment(), 4);
		assertAliases(5);
		exports.destructure(9);
		assertAliases(9);
	}
});
