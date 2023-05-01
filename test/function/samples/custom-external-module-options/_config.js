const assert = require('node:assert');

module.exports = defineTest({
	description: 'supports adding custom options to external modules',
	options: {
		plugins: [
			{
				name: 'test-plugin',
				async resolveId(id) {
					if (id === 'external') {
						return { id, external: true, meta: { 'test-plugin': { resolved: true } } };
					}
				}
			},
			{
				name: 'wrap-up',
				buildEnd() {
					assert.deepStrictEqual(this.getModuleInfo('external').meta, {
						'test-plugin': { resolved: true }
					});
				}
			}
		]
	}
});
