module.exports = {
	description: 'deconflicts the interop function for "true"',
	options: {
		strictDeprecations: false,
		external(id) {
			return id.startsWith('external');
		},
		output: {
			interop: true
		}
	},
	context: {
		require: () => {
			return Object.defineProperty({ foo: 'foo', default: 'bar' }, '__esModule', { value: true });
		}
	}
};
