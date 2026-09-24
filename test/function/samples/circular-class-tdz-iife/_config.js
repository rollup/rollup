const path = require('node:path');

const declareId = path.join(__dirname, 'declare.js');
const useId = path.join(__dirname, 'use.js');

module.exports = defineTest({
	description:
		'initializes a class before a circular binding created by an immediately invoked function',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [declareId, useId, declareId],
			message: 'Circular dependency: declare.js -> use.js -> declare.js'
		}
	]
});
