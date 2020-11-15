module.exports = {
	solo: true,
	description: 'handles amd.id with the [id] pattern and code splitting',
	options: {
		input: ['main'],
		output: {
			amd: {
				id: 'something/[id]'
			}
		}
	},
	runAmd: true
};
