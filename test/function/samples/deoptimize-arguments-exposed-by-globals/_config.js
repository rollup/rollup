module.exports = defineTest({
	description: 'deoptimizes arguments of known globals that can be mutated via the return value',
	async exports({ promise }) {
		await promise;
	}
});
