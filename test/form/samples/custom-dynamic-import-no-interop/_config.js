module.exports = defineTest({
	description: 'does not add any interop when using a custom dynamic import handler',
	options: {
		external: 'external',
		output: {
			interop: 'auto'
		},
		plugins: [
			{
				name: 'test',
				renderDynamicImport() {
					return { left: 'getIt(', right: ')' };
				}
			}
		]
	}
});
