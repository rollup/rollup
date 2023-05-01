const path = require('node:path');
const ID_B = path.join(__dirname, 'b.js');
const ID_C = path.join(__dirname, 'c.js');
const ID_D = path.join(__dirname, 'd.js');

module.exports = defineTest({
	description: 'does not stack overflow on crazy cyclical dependencies',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_C, ID_D, ID_B, ID_C],
			message: 'Circular dependency: c.js -> d.js -> b.js -> c.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_C, ID_D, ID_C],
			message: 'Circular dependency: c.js -> d.js -> c.js'
		}
	]
});
