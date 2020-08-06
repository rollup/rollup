module.exports = {
	description: 'deconflicts the interop function',
	options: {
		external: ['external1', 'external2', 'external3'],
		output: {
			interop(id) {
				if (id === 'external1') {
					return true;
				}
				return 'auto';
			}
		}
	},
	context: {
		require: id => {
			if (id === 'external1') return 1;
			if (id === 'external2') return 2;
			if (id === 'external3') return 3;
			throw new Error(`Unexpected require "${id}"`);
		}
	}
};
