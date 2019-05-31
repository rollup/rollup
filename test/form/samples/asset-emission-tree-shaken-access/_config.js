const fs = require('fs');
const path = require('path');

module.exports = {
	description: 'does not include format globals when tree-shaking an asset access',
	options: {
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
