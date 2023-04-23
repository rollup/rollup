module.exports = defineRollupTest({
	description: 'imports default from external module',
	options: {
		external: ['path']
	}
});
