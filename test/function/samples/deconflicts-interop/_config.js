module.exports = {
	description: 'deconflicts the interop function',
	options: {
		external: ['external1', 'external2']
	},
	context: {
		require: id => {
			if (id === 'external1') return 42;
			if (id === 'external2') return 43;
			return require(id);
		}
	}
};
