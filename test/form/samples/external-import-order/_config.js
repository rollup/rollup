module.exports = defineTest({
	description: 'Retain the execution order of external imports',
	options: {
		external(id) {
			return id.startsWith('external');
		}
	}
});
