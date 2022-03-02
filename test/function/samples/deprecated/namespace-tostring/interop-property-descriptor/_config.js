module.exports = {
	description: 'generated interop namespaces should have correct Symbol.toStringTag',
	context: {
		require() {
			return { answer: 42 };
		}
	},
	options: {
		strictDeprecations: false,
		external(id) {
			return id.includes('external');
		},
		output: {
			namespaceToStringTag: true,
			interop(id) {
				return id.split('-')[1];
			}
		}
	}
};
