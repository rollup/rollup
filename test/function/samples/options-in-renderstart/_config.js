const assert = require('assert');
const checkedOptions = [];

module.exports = {
	description: 'makes input and output options available in renderStart',
	options: {
		context: 'global',
		plugins: {
			name: 'input-plugin',
			renderStart(outputOptions, inputOptions) {
				checkedOptions.push('input-plugin', outputOptions.format, inputOptions.context);
			}
		},
		output: {
			plugins: {
				name: 'output-plugin',
				renderStart(outputOptions, inputOptions) {
					checkedOptions.push('output-plugin', outputOptions.format, inputOptions.context);
				}
			}
		}
	},
	exports: () => {
		assert.deepStrictEqual(checkedOptions, [
			'output-plugin',
			'cjs',
			'global',
			'input-plugin',
			'cjs',
			'global'
		]);
	}
};
