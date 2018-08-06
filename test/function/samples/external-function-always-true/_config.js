module.exports = {
	description: 'skip entry point when testing for external',
	options: {
		external: id => true
	},
	context: {
		require: id => {
			if (id === 'external') return 42;
			return require(id);
		}
	}
};
