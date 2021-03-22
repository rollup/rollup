import plugin from './plugin/plugin.js';

export default {
	input: 'main.js',
	output: {
		format: 'es'
	},
	plugins: [plugin()]
};
