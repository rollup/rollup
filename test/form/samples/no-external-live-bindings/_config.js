module.exports = {
	description: 'Allows omitting the code that handles external live bindings',
	options: {
		external: () => true,
		output: {
			externalLiveBindings: false,
			name: 'bundle'
		}
	}
};
