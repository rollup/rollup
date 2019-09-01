module.exports = {
	description: 'entryFileNames pattern supported in combination with preserveModules',
	options: {
		input: 'src/main.ts',
		output: {
			entryFileNames: 'entry-[name]-[format].js'
		},
		preserveModules: true
	}
};
