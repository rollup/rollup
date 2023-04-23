module.exports = defineRollupTest({
	description: 'handles multiple var declarations inited to strings (#166)',
	options: { output: { name: 'myBundle' } }
});
