const assert = require('node:assert');
const path = require('node:path');

module.exports = defineTest({
	description: 'plugins can manipulate the options object',
	options: {
		plugins: [
			{
				options(options) {
					options.input = path.join(__dirname, 'answer.js');
				}
			}
		]
	},
	exports(answer) {
		assert.equal(answer, 42);
	}
});
