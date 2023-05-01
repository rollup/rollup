const assert = require('node:assert');

module.exports = defineTest({
	description: 'external function calls marked with pure comment do not have effects',
	options: {
		external: ['socks']
	},
	context: {
		require(id) {
			if (id === 'socks') {
				return () => {
					throw new Error('Not all socks were removed.');
				};
			}
		}
	},
	code(code) {
		assert.ok(code.search(/socks\(\)/) === -1);
	}
});
