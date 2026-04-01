module.exports = defineTest({
	description: 'does not warn for conflicting import attributes',
	options: {
		external: id => id.startsWith('external')
	}
});
