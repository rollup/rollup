module.exports = defineTest({
	description: 'make sure illegal percent encoding is sanitized',
	solo: true,
	options: {
		input: ['main.js']
	}
});
