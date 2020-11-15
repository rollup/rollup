module.exports = {
	solo: true,
	description: 'handles amd.id with the [id] pattern',
	options: {
		input: ['main'],
		output: {
			name: 'outputName',
			amd: {
				id: 'something/[id]'
			}
		}
	},
	additionalFormats: ['umd'],
	runAmd: exports => {
		return exports.getA();
	}
};
