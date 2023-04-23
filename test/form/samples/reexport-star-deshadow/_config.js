module.exports = defineRollupTest({
	description: 'Star reexports scope deshadowing',
	options: {
		output: {
			name: 'myBundle'
		}
	}
});
