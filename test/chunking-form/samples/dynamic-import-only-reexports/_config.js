module.exports = defineTest({
	description: 'handles dynamic imports when the imported module only reexports from other modules',
	options: {
		input: ['main']
	}
});
