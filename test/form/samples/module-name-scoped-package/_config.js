module.exports = defineTest({
	description: 'allows module name with dashes to be added to the global object',
	options: {
		output: {
			extend: true,
			name: '@scoped/npm-package'
		}
	}
});
