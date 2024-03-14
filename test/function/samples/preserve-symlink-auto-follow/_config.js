module.exports = defineTest({
	skipIfWindows: true,
	description: 'auto symlinks',
	options: {
		preserveSymlinks: 'auto'
	}
});
