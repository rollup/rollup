const assert = require('node:assert');

module.exports = defineTest({
	description: 'are injected into the source and sourcemaps',
	options: {
		output: {
			name: 'myModule',
			sourcemapDebugIds: true
		}
	},
	async test(code, map) {
		const match = code.match(
			/\/\/# debugId=([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/
		);
		assert.ok(match, 'Could not find debugId in source');
		const sourceDebugId = match[1];
		assert.equal(
			map.debugId,
			sourceDebugId,
			"debugId in source doesn't match debugId in sourcemap"
		);
	}
});
