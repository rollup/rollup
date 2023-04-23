const assert = require('node:assert');

module.exports = defineRollupTest({
	description: 'supports nested numeric paths without issues on Windows',
	options: {
		output: { preserveModules: true },
		plugins: [
			{
				name: 'test',
				generateBundle(options, bundle) {
					assert.deepStrictEqual(Object.keys(bundle), ['main.js', '0/1/nested.js']);
				}
			}
		]
	}
});
