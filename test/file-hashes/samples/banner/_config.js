module.exports = defineTest({
	description: 'creates different hashes if the banner differs',
	options1: {
		input: 'main',
		output: {
			banner: 'console.log(1);'
		}
	},
	options2: {
		input: 'main',
		output: {
			banner: 'console.log(2);'
		}
	}
});
