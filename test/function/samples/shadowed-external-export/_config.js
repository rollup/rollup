module.exports = defineRollupTest({
	description: 'external modules are not shadowed',
	options: {
		external: ['path']
	}
});
