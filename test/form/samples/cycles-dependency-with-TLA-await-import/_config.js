const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_LIB = path.join(__dirname, 'lib.js');

module.exports = defineTest({
	description: 'throw a warn when a cycle is detected which includes a top-level await import',
	options: {
		output: {
			inlineDynamicImports: true
		}
	},
	expectedWarnings: ['CIRCULAR_DEPENDENCY'],
	logs: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_LIB, ID_MAIN],
			level: 'warn',
			message: 'Circular dependency: main.js -> lib.js -> main.js'
		}
	]
});
