const checkedIds = new Set();

module.exports = {
	description: 'allows to configure the interop type per external dependency for boolean values',
	options: {
		strictDeprecations: false,
		external: id => id.startsWith('external'),
		output: {
			externalLiveBindings: false,
			interop(id) {
				if (checkedIds.has(id)) {
					throw new Error(`Interop for id ${id} has been requested twice.`);
				}
				checkedIds.add(id);
				return JSON.parse(id.split('-')[1]);
			},
			format: 'cjs'
		}
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
};
