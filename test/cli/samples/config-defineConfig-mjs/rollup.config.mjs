import { defineConfig } from "../../../../dist/es/rollup.js"

export default defineConfig({
	input: 'main.js',
	output: {
		format: 'cjs'
	},
});
