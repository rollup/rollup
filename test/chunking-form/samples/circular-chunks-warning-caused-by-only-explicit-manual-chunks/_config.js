module.exports = defineTest({
	description: 'Throw a warning for circular chunks caused by onlyExplicitManualChunks',
	options: {
		output: {
			manualChunks(id) {
				if (id.endsWith('a.js') || id.endsWith('c.js')) return 'ac';
			},
			onlyExplicitManualChunks: true
		}
	},
	expectedWarnings: ['CIRCULAR_CHUNK'],
	logs: new Array(4).fill(null).map(() => ({
		code: 'CIRCULAR_CHUNK',
		ids: ['main', 'ac', 'main'],
		level: 'warn',
		message:
			'Circular chunk: main -> ac -> main. Consider disabling the "output.onlyExplicitManualChunks" option, as enabling it causes the static dependencies of the manual chunk "ac" to be bundled into the chunk "main".'
	}))
});
