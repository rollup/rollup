// @ts-check
const { defineConfigFunction } = require('../../../../dist/shared/rollup')

module.exports = defineConfigFunction(args => ({
	input: 'my-input',
	output: {
		file: 'my-file',
		format: 'es'
	}
}))
