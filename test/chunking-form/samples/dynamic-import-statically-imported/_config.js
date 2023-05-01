module.exports = defineTest({
	description: 'handles dynamic imports of previously statically imported chunks',
	options: {
		input: ['main.js']
	}
});
