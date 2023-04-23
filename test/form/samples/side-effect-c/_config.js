module.exports = defineRollupTest({
	description: 'discards function with no side-effects',
	options: { output: { name: 'myBundle' } }
});
