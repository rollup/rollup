const path = require('node:path');

const declareId = path.join(__dirname, 'declare.js');
const useId = path.join(__dirname, 'use.js');

module.exports = defineTest({
	description:
		'keeps modules outside a cycle in place while moving a class before its circular constructor call',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [declareId, useId, declareId],
			message: 'Circular dependency: declare.js -> use.js -> declare.js'
		}
	]
});
