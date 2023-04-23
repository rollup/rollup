module.exports = defineRollupTest({
	description: 'disregards side-effects that are contained within a function',
	options: { output: { name: 'myBundle' } }
});
