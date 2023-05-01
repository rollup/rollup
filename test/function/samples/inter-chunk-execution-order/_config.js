const assert = require('node:assert');
const execution = { index: 0 };

module.exports = defineTest({
	description: 'sorts imports between chunks to closely match the actual execution order',
	context: { execution },
	options: {
		input: ['main.js', 'chunk1.js', 'chunk2.js']
	},
	exports() {
		assert.equal(execution.index, 4);
	}
});
