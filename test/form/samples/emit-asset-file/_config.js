const assert = require('assert');
const { readFileSync } = require('fs');
const path = require('path');

module.exports = {
	description: 'supports emitting assets from plugin hooks',
	options: {
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
						source: readFileSync(id)
					})};`;
				}
			},
			generateBundle(options, outputBundle) {
				const keys = Object.keys(outputBundle);
				assert.strictEqual(keys.length, 2);
				assert.strictEqual(keys[0], 'assets/logo-a2a2cdc4.svg');
				const asset = outputBundle[keys[0]];
				assert.strictEqual(asset.fileName, 'assets/logo-a2a2cdc4.svg');
				assert.strictEqual(asset.type, 'asset');
				assert.ok(
					asset.source.equals(readFileSync(path.resolve(__dirname, 'logo.svg'))),
					'asset has correct source'
				);
				assert.ok(keys[1].endsWith('.js'), `${keys[1]} ends with ".js"`);
			}
		}
	}
};
