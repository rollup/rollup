const path = require('node:path');

const ID_A = path.resolve(__dirname, 'a.js');
const ID_B = path.resolve(__dirname, 'b.js');
const ID_X = path.resolve(__dirname, 'x.js');

module.exports = defineTest({
	description:
		'in entry mode, manual chunks that reach each other through a shared module stay separate and trigger circular chunk warnings',
	expectedWarnings: ['CIRCULAR_DEPENDENCY', 'CIRCULAR_CHUNK'],
	logs: [
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_A, ID_X, ID_A],
			level: 'warn',
			message: 'Circular dependency: a.js -> x.js -> a.js'
		},
		{
			code: 'CIRCULAR_DEPENDENCY',
			ids: [ID_X, ID_B, ID_X],
			level: 'warn',
			message: 'Circular dependency: x.js -> b.js -> x.js'
		},
		...new Array(4).fill(null).flatMap(() => [
			{
				code: 'CIRCULAR_CHUNK',
				ids: ['a', 'x', 'a'],
				level: 'warn',
				message:
					'Circular chunk: a -> x -> a. Please adjust the manual chunks or the module structure.'
			},
			{
				code: 'CIRCULAR_CHUNK',
				ids: ['x', 'b', 'x'],
				level: 'warn',
				message:
					'Circular chunk: x -> b -> x. Please adjust the manual chunks or the module structure.'
			}
		])
	],
	options: {
		input: ['main.js'],
		output: {
			manualChunks: {
				a: ['a.js'],
				b: ['b.js']
			}
		}
	}
});
