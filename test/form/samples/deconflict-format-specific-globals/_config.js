module.exports = defineRollupTest({
	description: 'deconflicts format specific globals',
	options: {
		external: 'external',
		output: {
			globals: { external: 'external' },
			name: 'bundle',
			interop: 'auto',
			dynamicImportInCjs: false
		}
	}
});
