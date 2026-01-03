module.exports = defineTest({
	solo: true,
	description: 'preserves asynchronicity when handling dynamic imports without side effects',
	options: {
		treeshake: {
			moduleSideEffects: false
		}
	},
	async exports({ test }) {
		await test();
	}
});
