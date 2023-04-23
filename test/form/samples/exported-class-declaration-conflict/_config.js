module.exports = defineRollupTest({
	description: 'handles exporting class declarations with name conflicts in SystemJS',
	options: { output: { name: 'bundle' } }
});
