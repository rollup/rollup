module.exports = defineTest({
	description: 'imports external module for side effects',
	context: {
		// override require here, making "foo" appear as a global module
		require(name) {
			if (name === 'foo') {
				return require('./foo');
			}
			return require(name);
		}
	},
	options: {
		external: ['foo']
	}
});
