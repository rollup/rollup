module.exports = defineRollupTest({
	description: 'make sure internal exports are sanitized',
	options: {
		input: ['main.js']
	}
});
