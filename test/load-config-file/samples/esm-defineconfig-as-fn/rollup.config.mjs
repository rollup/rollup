// @ts-check
import { defineConfig } from '../../../../dist/es/rollup.js'

export default defineConfig(args => ({
	input: 'my-input',
	output: {
		file: 'my-file',
		format: 'es'
	}
}))
