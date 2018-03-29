var assert = require('assert');

let warnings = 0;

module.exports = commands => ({
	input: 'main.js',
	plugins: [
		{
			ongenerate() {
				assert.equal(warnings, 0);
			}
		},
	],
	onwarn(warning) {
		warnings++;
	}
});
