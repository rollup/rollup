module.exports = defineTest({
	description: 'deconflicts format specific globals',
	// Due to deconflicted variable name caching, there will be more deconflicted
	// names in "es" or "system" if they render after one of the other formats.
	// This is fine, but we need to disable shuffling to keep the test stable.
	shuffleFormats: false,
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
