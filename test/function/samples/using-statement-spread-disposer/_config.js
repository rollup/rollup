module.exports = defineTest({
	description: 'tracks writes through "this" in disposers copied via object spread',
	minNodeVersion: 24,
	async exports({ run }) {
		await run();
	}
});
