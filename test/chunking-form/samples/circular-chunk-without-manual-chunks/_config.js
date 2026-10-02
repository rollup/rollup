const path = require('node:path');

const ID_A = path.resolve(__dirname, 'a.js');
const ID_B = path.resolve(__dirname, 'b.js');

module.exports = defineTest({
	description:
		'warns about circular chunks without manual chunk advice when no manual chunks are involved',
	expectedWarnings: ['CIRCULAR_DEPENDENCY', 'CIRCULAR_CHUNK'],
	formats: ['es', 'system'],
	logs: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_A, ID_B, ID_A],
			level: 'warn',
			message: 'Circular dependency: a.js -> b.js -> a.js'
		},
		{
			code: 'CIRCULAR_CHUNK',
			ids: ['main', 'b', 'main'],
			level: 'warn',
			message: 'Circular chunk: main -> b -> main.'
		},
		{
			code: 'CIRCULAR_CHUNK',
			ids: ['main', 'b', 'main'],
			level: 'warn',
			message: 'Circular chunk: main -> b -> main.'
		}
	],
	options: {
		input: ['main.js']
	}
});
