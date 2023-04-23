module.exports = defineTest({
	description: 'allows external option to be a function (#522)',
	options: {
		external: id => id === 'external'
	},
	context: {
		require: id => {
			if (id === 'external') return 42;
			return require(id);
		}
	}
});
