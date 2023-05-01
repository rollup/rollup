module.exports = defineTest({
	description: 'does not expose exports of chunks which were used by tree-shaken dynamic imports',
	options: {
		input: ['main1.js', 'main2.js']
	}
});
