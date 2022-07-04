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
	},
	warnings: [
		{
			code: 'DEPRECATED_FEATURE',
			message:
				'The boolean value "true" for the "output.interop" option is deprecated. Use "auto" instead.',
			url: 'https://rollupjs.org/guide/en/#outputinterop'
		}
	]
};
