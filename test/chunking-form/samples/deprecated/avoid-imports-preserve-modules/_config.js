module.exports = defineTest({
	description:
		'avoids empty imports if they do not have side-effects when preserving modules (#3359)',
	options: {
		strictDeprecations: false,
		preserveModules: true
	},
	expectedWarnings: ['DEPRECATED_FEATURE']
});
