module.exports = defineTest({
	skipIfWindows: true,
	description: 'follows symlinks',
	options: {
		preserveSymlinks: true
	}
});
