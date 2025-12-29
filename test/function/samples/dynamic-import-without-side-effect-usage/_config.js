module.exports = defineTest({
	solo: true,
	description: 'detects usages of awaited dynamic imports without side effects',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	},
	async exports({ test }) {
		await test();
	}
});
