const path = require('node:path');

const firstId = path.join(__dirname, 'first.js');
const secondId = path.join(__dirname, 'second.js');

module.exports = defineTest({
	description:
		'keeps a circular const initializer before the module that reads it at top level',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [firstId, secondId, firstId],
			message: 'Circular dependency: first.js -> second.js -> first.js'
		}
	]
});
