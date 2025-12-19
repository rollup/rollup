module.exports = defineTest({
	description:
		'avoids circular TLA dynamic imports between chunks even when import is wrapped in a function',
	formats: ['es', 'system']
});
