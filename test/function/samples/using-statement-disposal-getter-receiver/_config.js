module.exports = defineTest({
	description: 'tracks writes through "this" in getters of disposal methods',
	minNodeVersion: 24,
	async exports({ run }) {
		await run();
	}
});
