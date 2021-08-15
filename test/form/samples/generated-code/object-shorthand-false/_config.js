module.exports = {
	description: 'uses object shorthand syntax',
	options: {
		output: {
			exports: 'named',
			format: 'system',
			generatedCode: { objectShorthand: false },
			name: 'bundle'
		}
	}
};
