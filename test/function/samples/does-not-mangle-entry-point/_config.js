const assert = require('node:assert');

const modules = {
	'x\\y': 'export default 42;',
	'x/y': 'export default 24;'
};

module.exports = defineTest({
	description: 'does not mangle input',
	options: {
		input: 'x\\y',
		plugins: [
			{
				resolveId(importee) {
					return importee;
				},
				load(moduleId) {
					return modules[moduleId];
				}
			}
		]
	},
	exports(exports) {
		assert.equal(exports, 42);
	}
});
