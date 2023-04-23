const assert = require('node:assert');
const mutated = {};

module.exports = defineTest({
	description: 'Wraps inlined default exports which are rendered for side-effects only',
	options: {
		external: ['external']
	},
	context: {
		require: () => mutated
	},
	bundle() {
		assert.ok(mutated.mutated);
		assert.ok(mutated.veryMutated);
		assert.ok(mutated.extremelyMutated);
		assert.ok(mutated.utterlyMutated);
	}
});
