module.exports = defineTest({
	description: 'creates different hashes if the outro differs',
	options1: {
		input: 'main',
		output: {
			outro: 'console.log(1);'
		}
	},
	options2: {
		input: 'main',
		output: {
			outro: 'console.log(2);'
		}
	}
});
