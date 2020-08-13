module.exports = {
	description: 'does not add any interop when using a custom dynamic import handler',
	options: {
		external: 'external',
		output: {
			interop: 'auto'
		},
		plugins: {
			renderDynamicImport() {
				return { left: 'getIt(', right: ')' };
			}
		}
	}
};
