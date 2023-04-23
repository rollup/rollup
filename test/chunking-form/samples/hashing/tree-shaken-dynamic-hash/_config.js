module.exports = defineTest({
	description:
		'Does not fail when calculating the hash of a file containing a tree-shaken dynamic import',
	options: {
		input: ['main.js'],
		output: {
			entryFileNames: '[hash].js'
		}
	}
});
