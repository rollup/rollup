module.exports = defineRollupTest({
	description: 'excludes functions that are known to be pure',
	options: { output: { name: 'myBundle' } }
});
