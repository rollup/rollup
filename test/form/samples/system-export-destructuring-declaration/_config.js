module.exports = defineRollupTest({
	description: 'supports destructuring declarations for systemJS',
	options: {
		output: {
			format: 'system'
		}
	}
});
