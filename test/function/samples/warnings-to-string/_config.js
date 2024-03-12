const assert = require('node:assert');

module.exports = defineTest({
	description: 'provides a string conversion for warnings',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				transform(code) {
					this.warn('This might be removed', code.indexOf('removed'));
				}
			}
		]
	},
	warnings(warnings) {
		assert.deepStrictEqual(warnings.map(String), [
			'[plugin test-plugin] main.js (1:6): This might be removed',
			'Generated an empty chunk: "main".'
		]);
	}
});
