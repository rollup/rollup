module.exports = defineTest({
	description: 'generated interop namespaces should have correct Symbol.toStringTag',
	context: {
		require() {
			return { answer: 42 };
		}
	},
	options: {
		external(id) {
			return id.includes('external');
		},
		output: {
			generatedCode: { symbols: true },
			interop(id) {
				return id.split('-')[1];
			}
		}
	}
});
