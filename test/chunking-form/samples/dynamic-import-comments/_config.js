module.exports = defineTest({
	description: 'does not remove inline comments inside dynamic imports',
	options: {
		input: 'main.js',
		onwarn() {},
		plugins: {
			renderDynamicImport() {
				return { left: 'foobar(', right: ')' };
			},
			resolveDynamicImport() {
				return false;
			}
		}
	}
});
