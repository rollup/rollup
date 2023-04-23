module.exports = defineTest({
	description: 'correct sourcemaps are written (separate file) without comment',
	skipIfWindows: true,
	options: {
		output: { sourcemap: 'hidden' }
	}
});
