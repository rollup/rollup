module.exports = defineTest({
	description: 'allows live bindings for default exports',
	options: {
		output: { exports: 'named', name: 'bundle' }
	}
});
