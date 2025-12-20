module.exports = defineTest({
	description: 'preserves Symbol.asyncDispose side effects when used in an async using statement',
	minNodeVersion: 24,
	async exports({ run }) {
		await run();
	}
});
