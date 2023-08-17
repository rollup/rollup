module.exports = defineTest({
	description: 'allows relative external dependencies outside of output dir',
	options: {
		input: { main: 'main.js', 'nested/main': 'nested/main.js' },
		external(id) {
			return id.startsWith('../');
		}
	}
});
