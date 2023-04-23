module.exports = defineRollupTest({
	description: 'supports double hashes in patterns',
	options: {
		output: { entryFileNames: '[hash]/entry-[hash].js' }
	}
});
