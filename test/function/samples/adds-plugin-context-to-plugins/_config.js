const assert = require('assert');

module.exports = {
	description: 'Adds plugin context to plugins with perf=true',
	options: {
		perf: true,
		plugins: [
			{
				load() {
					assert.ok(typeof this.parse === 'function');
				},

				resolveDynamicImport() {
					assert.ok(typeof this.parse === 'function');
				},

				resolveId() {
					assert.ok(typeof this.parse === 'function');
				},

				transform() {
					assert.ok(typeof this.parse === 'function');
				}
			}
		]
	}
};
