module.exports = defineTest({
	description:
		'does not strip preserveModulesRoot from a module in a sibling directory that merely shares its name as a string prefix',
	options: {
		input: ['src/module.js', 'src-sibling/module.js'],
		output: {
			preserveModules: true,
			preserveModulesRoot: 'src'
		}
	}
});
