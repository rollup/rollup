module.exports = defineRollupTest({
	description: 'amd.define',
	options: {
		output: {
			amd: { define: 'enifed' }
		}
	}
});
