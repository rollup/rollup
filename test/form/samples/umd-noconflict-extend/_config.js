module.exports = defineTest({
	description: 'exports noConflict method for default umd when requested',
	options: {
		output: {
			extend: true,
			noConflict: true,
			name: 'FooBar'
		}
	}
});
