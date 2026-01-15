module.exports = defineTest({
	description: 'tracks mutating dynamic import properties via "then"',
	async exports({ test }) {
		await test();
	}
});
