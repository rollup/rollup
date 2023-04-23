module.exports = defineRollupTest({
	description: 'allows `export *` from external module, internally',
	options: {
		external: ['path']
	}
});
