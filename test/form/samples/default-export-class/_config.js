module.exports = defineRollupTest({
	description: 'puts the export after the declaration for default exported classes in SystemJS',
	options: {
		output: {
			name: 'bundle'
		}
	}
});
