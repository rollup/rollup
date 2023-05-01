module.exports = defineTest({
	description: 'preserves comments between imports and first statement',
	options: { output: { name: 'myBundle' } }
});

// https://github.com/esperantojs/esperanto/issues/187
