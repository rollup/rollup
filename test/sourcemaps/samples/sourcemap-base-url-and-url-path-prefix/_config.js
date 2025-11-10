const assert = require('node:assert');

module.exports = defineTest({
	description: 'adds a sourcemap base url and a url path prefix',
	options: {
		output: {
			sourcemapBaseUrl: 'https://example.com/a/',
			sourcemapUrlPathPrefix: '/my-sourcemaps-server/'
		}
	},
	test: (code, map, { format }) => {
		assert.equal(map.file, `bundle.${format}.js`);
		const sourceMappingURL = code.split('\n').slice(-2)[0];
		assert.equal(
			sourceMappingURL,
			`//# sourceMappingURL=https://example.com/a/my-sourcemaps-server/bundle.${format}.js.map`
		);
	}
});
