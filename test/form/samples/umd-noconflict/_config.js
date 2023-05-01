module.exports = defineTest({
	description: 'exports noConflict method for default umd when requested',
	options: {
		output: {
			noConflict: true,
			name: 'FooBar'
		}
	}
});
