module.exports = {
	solo: true,
	description: 'creates different hashes if the content is equal but the generated exports differ',
	options1: {
		input: ['main1', 'other']
	},
	options2: {
		input: ['main2', 'other']
	},
	expectedDifferentHashes: ['dep.js']
};
