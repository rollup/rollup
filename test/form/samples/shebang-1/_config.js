const assert = require('node:assert');

module.exports = defineTest({
	description: 'preserve shebang in entry module for CJS and ESM outputs',
	options: {
		plugins: [
			{
				generateBundle(options, outputBundle) {
					const keys = Object.keys(outputBundle);
					if (options.format === 'cjs' || options.format === 'es') {
						assert.ok(outputBundle[keys[0]].code.startsWith('#!'));
					} else {
						assert.ok(!outputBundle[keys[0]].code.includes('#!'));
					}
				}
			}
		]
	}
});
