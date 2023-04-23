module.exports = defineRollupTest({
	description: 'extends module correctly',
	options: {
		output: {
			extend: true,
			name: 'foo'
		}
	}
});
