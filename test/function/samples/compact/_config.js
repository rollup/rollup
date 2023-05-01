const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'compact output with compact: true',
	options: {
		external: ['external'],
		output: {
			compact: true,
			generatedCode: { symbols: true }
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_MAIN],
			message: 'Circular dependency: main.js -> main.js'
		}
	],
	context: {
		require() {
			return 42;
		}
	}
});
