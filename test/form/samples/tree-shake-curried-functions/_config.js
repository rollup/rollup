module.exports = defineRollupTest({
	description: 'Remove side-effect-free curried functions (#1263)',
	expectedWarnings: ['EMPTY_BUNDLE']
});
