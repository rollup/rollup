const fs = require('fs');
const path = require('path');
const assert = require('assert');

module.exports = {
	description: 'supports emitting assets from plugin hooks',
	options: {
		strictDeprecations: false,
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
			},
			generateBundle(options, outputBundle) {
				const keys = Object.keys(outputBundle);
				assert.strictEqual(keys.length, 2);
				assert.strictEqual(keys[0], 'assets/logo-25585ac1.svg');
				const asset = outputBundle[keys[0]];
				assert.strictEqual(asset.fileName, 'assets/logo-25585ac1.svg');
				assert.strictEqual(asset.isAsset, true);
				assert.strictEqual(asset.type, 'asset');
				assert.ok(
					asset.source.equals(fs.readFileSync(path.resolve(__dirname, 'logo.svg'))),
					'asset has correct source'
				);
				assert.ok(keys[1].endsWith('.js'), `${keys[1]} ends with ".js"`);
			}
		}
	}
};
