const assert = require('node:assert');

const logs = [];

module.exports = defineTest({
	description: 'runs instance field initializers of instantiated classes',
	context: {
		log(message) {
			logs.push(message);
		}
	},
	exports() {
		assert.deepStrictEqual(logs, ['public', 'private', 'inherited', 'getter']);
	}
});
