module.exports = defineRollupTest({
	description: 'properly encodes reserved names if namespace import is used',
	options: {
		input: ['main.js']
	}
});
