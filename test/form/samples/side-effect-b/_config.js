module.exports = defineRollupTest({
	description: 'discards IIFE with no side-effects',
	options: { output: { name: 'myBundle' } }
});
