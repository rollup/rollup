const assert = require('node:assert');
const checkedOptions = [];

module.exports = defineTest({
	description: 'makes input and output options available in renderStart',
	options: {
		context: 'global',
		plugins: [
			{
				name: 'input-plugin',
				renderStart(outputOptions, inputOptions) {
					checkedOptions.push('input-plugin', outputOptions.format, inputOptions.context);
				}
			}
		],
		output: {
			plugins: [
				{
					name: 'output-plugin',
					renderStart(outputOptions, inputOptions) {
						checkedOptions.push('output-plugin', outputOptions.format, inputOptions.context);
					}
				}
			]
		}
	},
	exports: () => {
		assert.deepStrictEqual(checkedOptions, [
			'input-plugin',
			'cjs',
			'global',
			'output-plugin',
			'cjs',
			'global'
		]);
	}
});
