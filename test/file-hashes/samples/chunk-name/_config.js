module.exports = {
	solo: true,
	show: true,
	description: 'creates different hashes if the name pattern differs',
	options1: {
		input: {
			main: 'main',
			a: 'main2'
		},
		output: {
			entryFileNames: '[name].js'
		}
	},
	options2: {
		input: {
			main: 'main',
			b: 'main2'
		},
		output: {
			entryFileNames: '[name].js'
		}
	}
};
