module.exports = defineRollupTest({
	description: 'exports noConflict method for default umd when requested',
	options: {
		output: {
			noConflict: true,
			name: 'my.name.spaced.module'
		}
	}
});
