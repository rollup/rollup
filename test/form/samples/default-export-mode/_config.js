module.exports = defineRollupTest({
	description: 'allows specifying the export mode to be "default"',
	options: {
		output: {
			exports: 'default',
			name: 'bundle'
		}
	}
});
