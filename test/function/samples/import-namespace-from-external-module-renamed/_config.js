module.exports = defineRollupTest({
	description: 'imports a namespace from an external module and renames it',
	options: {
		external: ['path']
	}
});
