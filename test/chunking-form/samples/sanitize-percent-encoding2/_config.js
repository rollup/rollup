module.exports = defineTest({
	description: 'make sure illegal percent encoding is sanitized for dynamic imports',
	options: {
		input: ['main.js']
	}
});
