module.exports = defineTest({
	description: 'allows external option to be a regex',
	options: {
		external: /external/
	},
	context: {
		require: id => {
			if (id === 'external') return 42;
			return require(id);
		}
	}
});
