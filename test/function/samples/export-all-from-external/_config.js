module.exports = defineTest({
	description: 'allows `export *` from external module, internally',
	options: {
		external: ['path']
	}
});
