module.exports = {
	description: 'adds Symbol.toStringTag property to external namespaces',
	options: {
		external(id) {
			return id.startsWith('external');
		},
		output: {
			namespaceToStringTag: true,
			interop(id) {
				switch (id) {
					case 'external-auto':
						return 'auto';
					case 'external-default':
						return 'default';
					case 'external-defaultOnly':
						return 'defaultOnly';
					default:
						throw new Error(`Unexpected require "${id}"`);
				}
			}
		}
	},
	context: {
		require(id) {
			return { foo: 42 };
		}
	}
};
