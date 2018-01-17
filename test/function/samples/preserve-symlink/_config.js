module.exports = {
	skip: process.platform === 'win32',
	description: 'follows symlinks',
	options: {
		preserveSymlinks: true
	}
};
