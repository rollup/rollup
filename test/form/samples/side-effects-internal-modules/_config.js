const assert = require('node:assert');
const VIRTUAL_ID = '\0virtual';

module.exports = defineTest({
	description: 'does not pass internal modules to moduleSideEffects',
	expectedWarnings: ['EMPTY_BUNDLE'],
	options: {
		treeshake: {
			moduleSideEffects: id => {
				assert.notStrictEqual(id, VIRTUAL_ID);
				return false;
			}
		},
		plugins: {
			name: 'test-plugin',
			resolveId(id) {
				if (id === 'virtual') {
					return VIRTUAL_ID;
				}
			},
			load(id) {
				if (id === VIRTUAL_ID) {
					return "console.log('effect')";
				}
			}
		}
	}
});
