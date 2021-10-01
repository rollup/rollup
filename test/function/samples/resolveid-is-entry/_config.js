const assert = require('assert');
const path = require('path');

const ID_MAIN = path.join(__dirname, 'main.js');

module.exports = {
	description: 'sends correct isEntry information to resolveId hooks',
	options: {
		plugins: [
			{
				async buildStart() {
					return Promise.all([
						this.emitFile({ type: 'chunk', id: 'chunkWithoutImporter.js' }),
						this.emitFile({ type: 'chunk', id: './chunkWithImporter.js', importer: ID_MAIN }),
						this.resolve('./resolutionWithoutImporter'),
						this.resolve('./resolutionWithoutImporterEntry', undefined, { isEntry: true }),
						this.resolve('./resolutionWithoutImporterNonEntry', undefined, { isEntry: false }),
						this.resolve('./resolutionWithImporter', ID_MAIN),
						this.resolve('./resolutionWithImporterEntry', ID_MAIN, { isEntry: true }),
						this.resolve('./resolutionWithImporterNonEntry', ID_MAIN, { isEntry: false })
					]);
				},
				resolveId(source, importer, { isEntry }) {
					switch (source) {
						case ID_MAIN:
							assert.strictEqual(importer, undefined, source);
							assert.strictEqual(isEntry, true, source);
							break;
						case './dep.js':
							assert.strictEqual(importer, ID_MAIN, source);
							assert.strictEqual(isEntry, false, source);
							break;
						case 'chunkWithoutImporter.js':
							assert.strictEqual(importer, undefined, source);
							assert.strictEqual(isEntry, true, source);
							break;
						case './chunkWithImporter.js':
							assert.strictEqual(importer, ID_MAIN, source);
							assert.strictEqual(isEntry, true, source);
							break;
						case './resolutionWithoutImporter':
							assert.strictEqual(importer, undefined, source);
							assert.strictEqual(isEntry, true, source);
							break;
						case './resolutionWithoutImporterEntry':
							assert.strictEqual(importer, undefined, source);
							assert.strictEqual(isEntry, true, source);
							break;
						case './resolutionWithoutImporterNonEntry':
							assert.strictEqual(importer, undefined, source);
							assert.strictEqual(isEntry, false, source);
							break;
						case './resolutionWithImporter':
							assert.strictEqual(importer, ID_MAIN, source);
							assert.strictEqual(isEntry, false, source);
							break;
						case './resolutionWithImporterEntry':
							assert.strictEqual(importer, ID_MAIN, source);
							assert.strictEqual(isEntry, true, source);
							break;
						case './resolutionWithImporterNonEntry':
							assert.strictEqual(importer, ID_MAIN, source);
							assert.strictEqual(isEntry, false, source);
							break;
						default:
							throw new Error(`Unexpected resolution of ${source}`);
					}
				}
			}
		]
	}
};
