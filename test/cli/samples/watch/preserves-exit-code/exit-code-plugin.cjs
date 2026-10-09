module.exports = () => ({
	name: 'exit-code',
	buildEnd() {
		process.exitCode = 7;
	}
});
