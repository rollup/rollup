module.exports = defineRollupTest({
	description: 'correct sourcemaps are written (excluding sourceContent)',
	skipIfWindows: true,
	options: {
		output: { sourcemap: true, sourcemapExcludeSources: true }
	}
});
