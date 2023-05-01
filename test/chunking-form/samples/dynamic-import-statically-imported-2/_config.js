module.exports = defineTest({
	description:
		'handles dynamic imports of previously statically imported chunks that are also dynamically imported by other chunks',
	options: {
		input: ['main.js', 'main2.js']
	}
});
