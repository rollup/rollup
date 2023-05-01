module.exports = defineTest({
	skip: process.platform === 'win32',
	description: 'follows symlinks'
});
