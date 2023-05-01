module.exports = defineTest({
	description:
		'handles synthetic named exports that are reexported as a default export where both the default and a named export is used',
	options: {
		input: ['main.js'],
		plugins: {
			transform(code) {
				return { code, syntheticNamedExports: true };
			}
		}
	}
});
