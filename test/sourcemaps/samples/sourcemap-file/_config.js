const assert = require('node:assert');

module.exports = defineTest({
	description: 'populates file property of sourcemap when plugins are used (#986)',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform() {
					return null;
				}
			}
		]
	},
	test: (code, map, profile) => {
		assert.equal(map.file, `bundle.${profile.format}.js`);
	}
});
