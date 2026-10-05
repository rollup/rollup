module.exports = defineTest({
	description: 'preserves disposal behavior for aliases, mutations and unknown disposers',
	minNodeVersion: 24,
	async exports({ run, runConditionalDisposers }) {
		await run();
		await runConditionalDisposers(true);
		await runConditionalDisposers(false);
	}
});
