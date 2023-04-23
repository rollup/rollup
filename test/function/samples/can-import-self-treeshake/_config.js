const path = require('node:path');
const ID_LIB = path.join(__dirname, 'lib.js');

module.exports = defineTest({
	description: 'direct self import',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_LIB, ID_LIB],
			message: 'Circular dependency: lib.js -> lib.js'
		},
		{
			code: 'EMPTY_BUNDLE',
			message: 'Generated an empty chunk: "main".',
			names: ['main']
		}
	]
});
