module.exports = {
	description: 'adds the __esModule marker to namespaces',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			interop(id) {
				switch (id) {
					case 'external1':
						return 'auto';
					case 'external2':
						return 'default';
					case 'external3':
						return 'defaultOnly';
					default:
						throw new Error(`Unexpected external import ${id}`);
				}
			}
		}
	},
	exports(exports) {
		return exports;
	}
};
