module.exports = defineTest({
	description: 'describes unresolved manualChunks modules with attributes in the error message',
	options: {
		output: {
			manualChunks: {
				data: [{ attributes: { type: 'json' }, rawId: './missing.js' }]
			}
		}
	},
	generateError: {
		code: 'UNRESOLVED_ENTRY',
		message: 'Could not resolve entry module "./missing.js" with import attributes {"type":"json"}.'
	}
});
