const assert = require('node:assert');
let oldConsoleWarn;
const warnings = [];

module.exports = defineTest({
	description: 'logs as a fallback if no onwarn handler is provided',
	options: {
		onwarn: null
	},
	before() {
		oldConsoleWarn = console.warn;
		console.warn = message => warnings.push(message);
	},
	after() {
		console.warn = oldConsoleWarn;
		assert.deepStrictEqual(warnings, [
			'Use of eval in "main.js" is strongly discouraged as it poses security risks and may cause issues with minification.'
		]);
	}
});
