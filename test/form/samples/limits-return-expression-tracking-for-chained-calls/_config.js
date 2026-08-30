module.exports = defineTest({
	description: 'tracks at most 64 return expressions without losing call purity',
	options: {
		treeshake: {
			manualPureFunctions: Array.from({ length: 65 }, (_, index) => `pure${index}`)
		}
	}
});
