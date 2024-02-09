const assert = require('node:assert');
const { readFileSync } = require('node:fs');
const path = require('node:path');

module.exports = defineTest({
	description: 'supports emitting assets from plugin hooks',
	options: {
		plugins: [
			{
				name: 'test',
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
					assert.strictEqual(keys[0], 'assets/logo-zDlmrXar.svg');
					const asset = outputBundle[keys[0]];
					assert.strictEqual(asset.fileName, 'assets/logo-zDlmrXar.svg');
					if (asset.type !== 'asset') {
						throw new Error(`Unexpected asset type ${asset.type}.`);
					}
					/** @type {any} */
					const source = asset.source;
					assert.ok(
						source.equals(readFileSync(path.resolve(__dirname, 'logo.svg'))),
						'asset has correct source'
					);
					assert.ok(keys[1].endsWith('.js'), `${keys[1]} ends with ".js"`);
				}
			}
		]
	}
});
