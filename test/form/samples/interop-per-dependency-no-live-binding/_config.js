const checkedIds = new Set();

module.exports = {
	description: 'allows to configure the interop type per external dependency',
	options: {
		external: id => id.startsWith('external'),
		output: {
			externalLiveBindings: false,
			interop(id) {
				if (checkedIds.has(id)) {
					throw new Error(`Interop for id ${id} has been requested twice.`);
				}
				checkedIds.add(id);
				return id.split('-')[1];
			},
			format: 'cjs'
		}
	}
};
