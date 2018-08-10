const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'plugins can manipulate the options object',
	options: {
		plugins: [
			{
				options(options, meta) {
					options.input = path.resolve(__dirname, 'answer.js');
					assert(meta);
					assert(meta.version);
				}
			}
		]
	},
	exports(answer) {
		assert.equal(answer, 42);
	}
};
