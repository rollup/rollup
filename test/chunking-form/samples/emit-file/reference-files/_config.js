const fs = require('fs');
const path = require('path');

module.exports = {
	description: 'allows referencing emitted files',
	options: {
		strictDeprecations: false,
		input: ['main.js'],
		output: {
			chunkFileNames: 'nested/chunk.js'
		},
		plugins: {
			resolveId(id, importee) {
				if (id.endsWith('.svg')) {
					return path.resolve(path.dirname(importee), id);
				}
			},
			load(id) {
				if (id.endsWith('.svg')) {
					return `export default import.meta.ROLLUP_FILE_URL_${this.emitFile({
						type: 'asset',
						name: path.basename(id),
						source: fs.readFileSync(id)
					})};`;
				}
			}
		}
	}
};
