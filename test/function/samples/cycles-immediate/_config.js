const path = require('node:path');
const ID_EVENS = path.join(__dirname, 'evens.js');
const ID_ODDS = path.join(__dirname, 'odds.js');

module.exports = defineTest({
	description: 'handles cycles where imports are immediately used',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_EVENS, ID_ODDS, ID_EVENS],
			message: 'Circular dependency: evens.js -> odds.js -> evens.js'
		}
	]
});

// Test copied from https://github.com/esnext/es6-module-transpiler/tree/master/test/examples/cycles-immediate
