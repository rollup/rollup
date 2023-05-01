module.exports = defineTest({
	description: 'allows global names to be specified for IIFE/UMD exports',
	options: {
		external: ['jquery'],
		output: { globals: { jquery: 'jQuery' } }
	}
});
