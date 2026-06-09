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
		ids: ['b', 'ac', 'b'],
		level: 'warn',
		message:
			'Circular chunk: b -> ac -> b. Please consider disabling the "output.onlyExplicitManualChunks" option, as enabling it causes modules located between the modules included in the manual chunk "ac" to be extracted into the separate chunk "b".'
	}))
});
