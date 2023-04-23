module.exports = defineRollupTest({
	description: 'imports a namespace from an external module',
	options: {
		external: ['path']
	}
});
