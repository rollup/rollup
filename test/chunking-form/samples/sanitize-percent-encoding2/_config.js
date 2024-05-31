module.exports = defineTest({
	description: 'make sure illegal percent encoding is sanitized for dynamic imports',
	solo: true,
	options: {
		input: ['main.js']
	}
});
