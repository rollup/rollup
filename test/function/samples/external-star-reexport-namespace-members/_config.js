const assert = require('node:assert/strict');

module.exports = defineTest({
	description:
		'merges external star reexports into namespace objects and keeps member accesses dynamic',
	options: {
		external: ['external'],
		output: { format: 'cjs' }
	},
	context: {
		require: id => {
			assert.equal(id, 'external');
			return { existing: 'value' };
		}
	}
});
