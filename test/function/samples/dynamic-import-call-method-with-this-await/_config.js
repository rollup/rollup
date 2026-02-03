module.exports = defineTest({
	description:
		'includes the correct "this" context when calling a method on a dynamically imported module via "await"',
	async exports({ test }) {
		await test();
	}
});
