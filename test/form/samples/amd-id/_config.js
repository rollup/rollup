module.exports = defineRollupTest({
	description: 'allows to declare an AMD id',
	options: { output: { amd: { id: 'my-id' } } }
});
