module.exports = defineTest({
	description: 'preserves disposal behavior for aliases, mutations and delegated calls',
	minNodeVersion: 24,
	async exports({ run }) {
		await run();
	}
});
