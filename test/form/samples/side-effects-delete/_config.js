module.exports = defineRollupTest({
	description: 'delete is only a side-effect for included variables',
	options: { output: { name: 'myBundle' } }
});
