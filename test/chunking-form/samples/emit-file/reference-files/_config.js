const { readFileSync } = require('node:fs');
const path = require('node:path');

module.exports = defineTest({
	description: 'allows referencing emitted files',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		preserveEntrySignatures: false,
		output: {
			chunkFileNames: 'nested/chunk.js'
		},
		plugins: {
			name: 'test-plugin',
			resolveId(id, importee) {
				if (id.endsWith('.svg') && importee) {
					return path.resolve(path.dirname(importee), id);
				}
			},
			load(id) {
				if (id.endsWith('.svg')) {
					return `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
						type: 'asset',
						name: path.basename(id),
						source: readFileSync(id)
					})};`;
				}
			}
		}
	}
});
