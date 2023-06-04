const assert = require('node:assert');

module.exports = defineTest({
	description: 'add a trailing slash automatically if it is missing',
	options: {
		output: {
			sourcemapBaseUrl: 'https://example.com/a'
		}
	},
	test: (code, map, { format }) => {
		const sourceMappingURL = code.split('\n').slice(-2)[0];
		assert.strictEqual(
			sourceMappingURL,
			`//# sourceMappingURL=https://example.com/a/bundle.${format}.js.map`
		);
	}
});
