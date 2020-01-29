const assert = require('assert');
let oldConsoleWarn;
const warnings = [];

module.exports = {
	description: 'provides a default handler for warnings to onwarn that handles strings and objects',
	options: {
		onwarn(warning, defaultHandler) {
			if (warning.code === 'EVAL') {
				defaultHandler(warning);
			} else {
				defaultHandler(warning.message);
			}
		}
	},
	before() {
		oldConsoleWarn = console.warn;
		console.warn = msg => warnings.push(msg);
	},
	after() {
		console.warn = oldConsoleWarn;
		assert.deepStrictEqual(warnings, [
			'Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification',
			'Entry module "main.js" is using named and default exports together. Consumers of your bundle will have to use `chunk["default"]` to access the default export, which may not be what you want. Use `output.exports: "named"` to disable this warning'
		]);
	}
};
