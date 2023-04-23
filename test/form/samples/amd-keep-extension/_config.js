module.exports = defineTest({
	description: 'keep extension for AMD modules',
	options: {
		external: ['./relative', 'abso/lute', './relative.js', 'abso/lute.js'],
		output: { amd: { forceJsExtensionForImports: true }, interop: 'default' }
	}
});
