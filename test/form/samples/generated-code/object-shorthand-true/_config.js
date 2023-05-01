module.exports = defineTest({
	description: 'uses object shorthand syntax',
	options: {
		output: {
			exports: 'named',
			format: 'system',
			generatedCode: { objectShorthand: true },
			name: 'bundle'
		}
	}
});
