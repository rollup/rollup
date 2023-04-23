module.exports = defineTest({
	description:
		'handles synthetic named exports that are reexported as a default export over several stages',
	options: {
		input: ['main.js'],
		plugins: {
			transform(code) {
				return { code, syntheticNamedExports: true };
			}
		}
	}
});
