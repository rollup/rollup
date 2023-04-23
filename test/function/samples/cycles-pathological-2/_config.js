const path = require('node:path');
const ID_MAIN = path.join(__dirname, 'main.js');
const ID_B = path.join(__dirname, 'b.js');
const ID_C = path.join(__dirname, 'c.js');
const ID_D = path.join(__dirname, 'd.js');

module.exports = defineTest({
	description: 'resolves even more pathological cyclical dependencies gracefully',
	warnings: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_B, ID_MAIN],
			message: 'Circular dependency: main.js -> b.js -> main.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_B, ID_D, ID_C, ID_B],
			message: 'Circular dependency: b.js -> d.js -> c.js -> b.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_MAIN, ID_B, ID_D, ID_C, ID_MAIN],
			message: 'Circular dependency: main.js -> b.js -> d.js -> c.js -> main.js'
		}
	]
});
