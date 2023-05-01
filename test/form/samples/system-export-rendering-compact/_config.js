module.exports = defineTest({
	description: 'Renders updates of exported variables for SystemJS output in compact mode',
	options: {
		output: {
			format: 'system',
			compact: true
		}
	}
});
