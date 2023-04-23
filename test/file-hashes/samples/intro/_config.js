module.exports = defineTest({
	description: 'creates different hashes if the intro differs',
	options1: {
		input: 'main',
		output: {
			intro: 'console.log(1);'
		}
	},
	options2: {
		input: 'main',
		output: {
			intro: 'console.log(2);'
		}
	}
});
