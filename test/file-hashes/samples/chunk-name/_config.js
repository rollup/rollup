module.exports = defineTest({
	description: 'creates different hashes if the name pattern differs',
	options1: {
		input: {
			main: 'main',
			foo: 'main2'
		},
		output: {
			entryFileNames: '[name]-[hash].js'
		}
	},
	options2: {
		input: {
			main: 'main',
			bar: 'main2'
		},
		output: {
			entryFileNames: '[name]-[hash].js'
		}
	}
});
