module.exports = defineTest({
	description: 'creates different hashes if the footer differs',
	options1: {
		input: 'main',
		output: {
			footer: 'console.log(1);'
		}
	},
	options2: {
		input: 'main',
		output: {
			footer: 'console.log(2);'
		}
	}
});
