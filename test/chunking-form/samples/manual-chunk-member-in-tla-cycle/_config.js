const path = require('node:path');

const ID_A = path.resolve(__dirname, 'a.js');
const ID_B = path.resolve(__dirname, 'b.js');

module.exports = defineTest({
	description:
		'manual chunk members are exempt from the top-level-await cycle singleton split and keep their alias',
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
			ids: ['manual', 'b', 'manual'],
			level: 'warn',
			message:
				'Circular chunk: manual -> b -> manual. Please adjust the manual chunks or the module structure.'
		},
		{
			code: 'CIRCULAR_CHUNK',
			ids: ['manual', 'b', 'manual'],
			level: 'warn',
			message:
				'Circular chunk: manual -> b -> manual. Please adjust the manual chunks or the module structure.'
		}
	],
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				manual: ['a.js']
			}
		}
	}
});
