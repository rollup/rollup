module.exports = defineRollupTest({
	description: 'exports noConflict even when there are no exports',
	options: {
		output: {
			noConflict: true,
			name: 'FooBar'
		}
	}
});
