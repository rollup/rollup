// @ts-check
const { defineConfig } = require('../../../../dist/shared/rollup')

module.exports = defineConfig(args => ({
	input: 'my-input',
	output: {
		file: 'my-file',
		format: 'es'
	}
}))
