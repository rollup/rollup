module.exports = defineTest({
	description: 'creates different hashes if the content of dependencies differs',
	options1: {
		input: { main: 'main1', dep: 'dep1' }
	},
	options2: {
		input: { main: 'main2', dep: 'dep2' }
	}
});
