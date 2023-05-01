module.exports = defineTest({
	description: 'correct sourcemaps are written (separate file)',
	skipIfWindows: true,
	options: {
		output: { sourcemap: true }
	}
});
