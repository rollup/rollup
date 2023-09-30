const assert = require('node:assert');

module.exports = defineTest({
	description: 'remove shebang in non-entry module for all format outputs',
	options: {
		plugins: [
			{
				generateBundle(_, outputBundle) {
					const keys = Object.keys(outputBundle);
					assert.ok(!outputBundle[keys[0]].code.includes('#!'));
				}
			}
		]
	}
});
