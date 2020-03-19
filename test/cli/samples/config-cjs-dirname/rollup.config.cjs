const plugin = require('./plugin');
const nestedPlugin = require('./nested/plugin');

module.exports = {
	input: 'main.js',
	output: { format: 'esm' },
	plugins: [plugin(), nestedPlugin()]
};
