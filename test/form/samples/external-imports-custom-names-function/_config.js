module.exports = defineTest({
	description: 'allows globals to be specified as a function',
	options: {
		external: ['a-b-c'],
		output: {
			globals(id) {
				return id.replace(/-/g, '_');
			}
		}
	}
});
