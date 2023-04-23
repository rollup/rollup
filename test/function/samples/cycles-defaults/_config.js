const path = require('node:path');
const ID_A = path.join(__dirname, 'a.js');
const ID_B = path.join(__dirname, 'b.js');

module.exports = defineTest({
	description: 'cycles work with default exports',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_A, ID_B, ID_A],
			message: 'Circular dependency: a.js -> b.js -> a.js'
		}
	]
});

// test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/cycles-defaults
