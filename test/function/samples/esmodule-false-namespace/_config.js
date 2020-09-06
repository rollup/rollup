module.exports = {
	description: 'does not add the __esModule marker to namespaces if esModule is false',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			esModule: false,
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
