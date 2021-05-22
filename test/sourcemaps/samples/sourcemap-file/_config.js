const assert = require('assert');

module.exports = {
	description: 'populates file property of sourcemap when plugins are used (#986)',
	options: {
		plugins: [
			{
				transform() {
					return null;
				}
			}
		]
	},
	test: (code, map, profile) => {
		assert.equal(map.file, `bundle.${profile.format}.js`);
	}
};
