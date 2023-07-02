const assert = require('node:assert');

module.exports = defineTest({
	description: 'adds a sourcemap base url',
	options: {
		output: {
			sourcemapBaseUrl: 'https://example.com/a/'
		}
	},
	test: (code, map, { format }) => {
		assert.equal(map.file, `bundle.${format}.js`);
		const sourceMappingURL = code.split('\n').slice(-2)[0];
		assert.equal(
			sourceMappingURL,
			`//# sourceMappingURL=https://example.com/a/bundle.${format}.js.map`
		);
	}
});
