const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

module.exports = defineTest({
	description: 'does not emit unreferenced assets if needsCodeReference is true',
	options: {
		output: {
			assetFileNames: '[name][extname]'
		},
		plugins: [
			{
				resolveId(source, importer) {
					if (source.endsWith('.svg')) {
						return path.resolve(path.dirname(importer), source);
					}
				},
				load(id) {
					if (id.endsWith('.svg')) {
						const referenceId = this.emitFile({
							type: 'asset',
							name: path.basename(id),
							needsCodeReference: true,
							source: fs.readFileSync(id)
						});
						return `export default import.meta.ROLLUP_FILE_URL_${referenceId}`;
					}
				},
				generateBundle(_, bundle) {
					assert.deepEqual(Object.keys(bundle), ['logo2.svg', 'main.js']);
				}
			}
		]
	}
});
