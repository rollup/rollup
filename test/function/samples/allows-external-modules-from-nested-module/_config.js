module.exports = defineRollupTest({
	description: 'imports external modules from nested internal modules',
	options: {
		external: ['path']
	}
});
