module.exports = {
	description: 'Allows omitting the code that handles external live bindings in compact mode',
	options: {
		external: () => true,
		output: {
			compact: true,
			externalLiveBindings: false,
			name: 'bundle'
		}
	}
};
