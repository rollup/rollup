module.exports = defineTest({
	description: 'preserves Symbol.dispose side effects when used in using statement',
	minNodeVersion: 24,
	async exports({ run }) {
		await run();
	}
});
