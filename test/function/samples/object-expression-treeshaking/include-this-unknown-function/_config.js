module.exports = defineTest({
	description: 'includes all context properties if the handler is unknown',
	context: {
		external() {
			this.bar();
		}
	}
});
