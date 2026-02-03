module.exports = defineTest({
	description: 'tracks mutating dynamic import properties via "await"',
	async exports({ test }) {
		await test();
	}
});
