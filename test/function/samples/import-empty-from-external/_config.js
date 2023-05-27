module.exports = defineTest({
	description: 'imports external module for side effects',
	context: {
		// override require here, making "foo" appear as a global module
		require(name) {
			if (name === 'foo') {
				// @ts-expect-error test file
				return require('./foo');
			}
			return require(name);
		}
	},
	options: {
		external: ['foo']
	}
});
