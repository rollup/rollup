const fs = require('fs');
const path = require('path');

module.exports = {
	description: 'supports emitting assets from plugin hooks',
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
					return `export default import.meta.ROLLUP_ASSET_URL_${this.emitAsset(
						path.basename(id),
						fs.readFileSync(id)
					)};`;
				}
			}
		}
	}
};
