const assert = require('assert');
const path = require('path');

module.exports = {
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
};
