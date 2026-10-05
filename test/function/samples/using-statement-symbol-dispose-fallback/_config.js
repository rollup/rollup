module.exports = defineTest({
	description: 'preserves synchronous disposal fallbacks in async using statements',
	minNodeVersion: 24,
	async exports({ run }) {
		await run();
	}
});
