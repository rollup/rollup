const { defineConfig } = require('../../../../dist/rollup');

module.exports = defineConfig({
	input: 'main.js',
	output: {
		format: 'cjs'
	}
});
