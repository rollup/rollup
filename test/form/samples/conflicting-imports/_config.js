module.exports = defineRollupTest({
	description: 'ensures bundle imports are deconflicted (#659)',
	options: {
		external: ['foo', 'bar'],
		output: {
			globals: {
				bar: 'bar',
				foo: 'foo'
			}
		}
	}
});
