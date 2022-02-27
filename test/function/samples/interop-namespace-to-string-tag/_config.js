module.exports = {
	description: 'generated interop namespaces should have correct Symbol.toStringTag',
	context: {
		require() {
			return 42;
		}
	},
	options: {
		external: true,
		output: {
			namespaceToStringTag: true,
			interop(id) {
				return id.split('-')[1];
			}
		}
	}
};
