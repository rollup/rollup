module.exports = defineTest({
	description: 'supports double hashes in patterns',
	options: {
		output: { entryFileNames: '[hash]/entry-[hash].js' }
	}
});
