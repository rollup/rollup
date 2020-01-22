const assert = require('assert');
let oldConsoleWarn;
const warnings = [];

module.exports = {
	description: 'logs as a fallback if no onwarn handler is provided',
	options: {
		onwarn: null
	},
	before() {
		oldConsoleWarn = console.warn;
		console.warn = msg => warnings.push(msg);
	},
	after() {
		console.warn = oldConsoleWarn;
		assert.deepStrictEqual(warnings, [
			'Use of eval is strongly discouraged, as it poses security risks and may cause issues with minification'
		]);
	}
};
