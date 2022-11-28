// @ts-check
import { defineConfigFunction } from '../../../../dist/es/rollup.js'

export default defineConfigFunction(args => ({
	input: 'my-input',
	output: {
		file: 'my-file',
		format: 'es'
	}
}))
