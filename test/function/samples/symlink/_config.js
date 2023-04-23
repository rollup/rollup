module.exports = defineRollupTest({
	skip: process.platform === 'win32',
	description: 'follows symlinks'
});
