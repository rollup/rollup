module.exports = defineRollupTest({
	description: 'does not rewrite class expression IDs',
	options: { output: { name: 'myModule' } }
});
