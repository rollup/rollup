module.exports = defineTest({
	description: 'nested chunks',
	options: {
		input: { main1: 'main1', 'nested/main2': 'main2' },
		external: './external.js'
	}
});
