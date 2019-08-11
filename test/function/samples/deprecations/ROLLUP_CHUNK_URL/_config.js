module.exports = {
	description: 'marks ROLLUP_CHUNK_URL as deprecated',
	options: {
		plugins: {
			resolveId(id) {
				if (id === 'chunk') {
					return id;
				}
			},
			load(id) {
				if (id === 'chunk') {
					return "console.log('chunk')";
				}
				return `export default import.meta.ROLLUP_CHUNK_URL_${this.emitFile({
					type: 'chunk',
					id: 'chunk'
				})};`;
			}
		}
	},
	generateError: {
		code: 'DEPRECATED_FEATURE',
		message:
			'Using the "ROLLUP_CHUNK_URL_" prefix to reference files is deprecated. Use the "ROLLUP_FILE_URL_" prefix instead.'
	}
};
