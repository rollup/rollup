module.exports = defineTest({
	description: 'does not use object shorthand syntax',
	options: {
		output: {
			exports: 'named',
			format: 'system',
			generatedCode: { objectShorthand: false },
			name: 'bundle'
		}
	}
});
