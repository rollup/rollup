module.exports = defineTest({
	description: 'method of external named import used inside prototype method (#68)',
	context: {
		// override require here, making "foo" appear as a global module
		require(name) {
			if (name === 'bar') {
				return require('./bar');
			}
			return require(name);
		}
	},
	options: {
		external: ['bar']
	}
});
