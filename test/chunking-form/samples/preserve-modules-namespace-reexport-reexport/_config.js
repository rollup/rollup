module.exports = defineRollupTest({
	description: 'handles doing a namespace reexport of a reexport',
	options: {
		output: {
			preserveModules: true
		}
	}
});
