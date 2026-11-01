module.exports = defineTest({
	description: 'Throw a warning for circular chunks caused by manual chunks conflict',
	options: {
		output: {
			manualChunks(id) {
				if (id.endsWith('a.js') || id.endsWith('c.js')) return 'ac';
				if (id.endsWith('b.js')) return 'b';
			}
		}
	},
	expectedWarnings: ['CIRCULAR_CHUNK'],
	logs: new Array(4).fill(null).map(() => ({
		code: 'CIRCULAR_CHUNK',
		ids: ['ac', 'b', 'ac'],
		level: 'warn',
		message: 'Circular chunk: ac -> b -> ac. Please adjust the manual chunk logic for these chunks.'
	}))
});
