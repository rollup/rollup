module.exports = defineTest({
	description:
		'avoiding circular TLA dynamic imports between chunks even with TLA dynamic imports in non-entry modules',
	formats: ['es', 'system']
});
