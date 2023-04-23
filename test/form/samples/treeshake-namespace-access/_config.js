module.exports = defineTest({
	description: 'does not count namespace property access as side-effect',
	options: { external: 'external' }
});
