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
				const interopType = id.split('-')[1];
				switch (interopType) {
					case 'true':
						return true;
					case 'false':
						return false;
					default:
						return interopType;
				}
			},
			format: 'cjs'
		}
	}
};
