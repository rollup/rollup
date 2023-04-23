module.exports = defineTest({
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
