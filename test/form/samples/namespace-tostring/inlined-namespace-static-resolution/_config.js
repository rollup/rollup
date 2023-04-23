module.exports = defineRollupTest({
	description: 'statically resolves Symbol.toStringTag for inlined namespaces',
	expectedWarnings: ['MISSING_EXPORT'],
	options: {
		output: {
			generatedCode: { symbols: true }
		}
	}
});
