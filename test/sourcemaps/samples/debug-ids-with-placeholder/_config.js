const assert = require('node:assert');

module.exports = defineTest({
	description: 'are injected into the source and sourcemaps when using placeholders',
	options: {
		output: {
			name: 'myModule',
			sourcemapDebugIds: true,
			entryFileNames: '[name]-[hash].js'
		}
	},
	async test(code, map) {
		const match = code.match(/\/\/# debugId=([a-fA-F0-9-]+)/);
		assert.ok(match, 'Could not find debugId in source');
		const sourceDebugId = match[1];
		assert.equal(
			map.debugId,
			sourceDebugId,
			"debugId in source doesn't match debugId in sourcemap"
		);
	}
});
