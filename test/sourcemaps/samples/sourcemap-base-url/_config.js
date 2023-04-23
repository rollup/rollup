const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

module.exports = defineTest({
	description: 'adds a sourcemap base url',
	options: {
		output: {
			sourcemapBaseUrl: 'https://example.com'
		}
	},
	test: (code, map, profile) => {
		assert.equal(map.file, `bundle.${profile.format}.js`);
		const bundlePath = path.join(__dirname, `_actual/bundle.${profile.format}.js`);
		const bundledCode = fs.readFileSync(bundlePath, { encoding: 'utf8', flag: 'r' });
		const sourceMappingURL = bundledCode.split('\n').slice(-2)[0];
		assert.equal(
			sourceMappingURL,
			`//# sourceMappingURL=https://example.com/bundle.${profile.format}.js.map`
		);
	}
});
