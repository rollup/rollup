module.exports = defineTest({
	description: 'correct sourcemaps are written (inline)',
	skipIfWindows: true,
	options: {
		output: { sourcemap: 'inline' }
	}
});
