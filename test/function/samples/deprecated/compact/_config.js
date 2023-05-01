const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = defineTest({
	description: 'compact output with compact: true',
	options: {
		strictDeprecations: false,
		external: ['external'],
		output: {
			compact: true,
			namespaceToStringTag: true
		}
	},
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_MAIN],
			message: 'Circular dependency: main.js -> main.js'
		},
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The "output.namespaceToStringTag" option is deprecated. Use the "output.generatedCode.symbols" option instead.',
			url: 'https://rollupjs.org/configuration-options/#output-generatedcode-symbols'
		}
	],
	context: {
		require() {
			return 42;
		}
	}
});
