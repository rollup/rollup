module.exports = defineTest({
	description: 'external modules are not shadowed',
	options: {
		external: ['path']
	}
});
