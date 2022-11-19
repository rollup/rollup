module.exports = {
	solo: true,
	description: 'allows to manually declare functions as pure by name',
	options: {
		treeshake: { manualPureFunctions: ['foo', 'bar.a'] }
	}
};
// TODO Lukas also tagged templates
// TODO Lukas also check "this" or arguments are not deoptimized
