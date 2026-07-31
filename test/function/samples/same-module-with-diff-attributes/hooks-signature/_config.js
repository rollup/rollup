const assert = require('assert');
const acorn = require('acorn');
const { serializeAst } = require('../../../../../dist/parseAst');

const quzCode = 'export const quz = "quz";';

let runHooks = 0;
module.exports = defineTest({
	description: 'Passes the right arguments to hooks',
	options: {
		cache: {
			modules: [
				{
					id: './quz.js',
					rawId: './quz.js',
					astBuffer: serializeAst(
						acorn.parse(quzCode, {
							ecmaVersion: 6,
							sourceType: 'module'
						})
					),
					attributes: { type: 'javascript' },
					code: quzCode,
					dependencies: [],
					customTransformCache: false,
					originalCode: quzCode,
					originalSourcemap: null,
					resolvedIds: {},
					sourcemapChain: [],
					transformDependencies: []
				}
			]
		},
		plugins: [
			{
				resolveId(id) {
					return id;
				},
				load(id, { rawId }) {
					runHooks |= 0b01;
					assert.ok(rawId);
					if (id.includes('quz.js')) {
						return quzCode;
					}
					if (id.includes('asset')) {
						const assetId = this.emitFile({
							type: 'asset',
							name: 'my-asset',
							source: 'Text content'
						});
						return `export default import.meta.ROLLUP_FILE_URL_${assetId}`;
					}
				},
				shouldTransformCachedModule({ rawId }) {
					runHooks |= 0b10;
					assert.ok(rawId);
				},
				transform(_code, _id, { rawId }) {
					runHooks |= 0b100;
					assert.ok(rawId);
				},
				resolveDynamicImport(_s, _importer, { importerRawId }) {
					runHooks |= 0b1000;
					assert.ok(importerRawId);
				},
				resolveImportMeta(_p, { moduleAttributes }) {
					runHooks |= 0b10000;
					assert.ok(moduleAttributes);
					return '"random-value"';
				},
				resolveFileUrl({ moduleAttributes }) {
					runHooks |= 0b100000;
					assert.ok(moduleAttributes);
					return '"random-url"';
				},
				renderDynamicImport({ targetModuleRawId, moduleRawId, moduleAttributes }) {
					runHooks |= 0b1000000;
					assert.ok(targetModuleRawId);
					assert.ok(moduleRawId);
					assert.ok(moduleAttributes);
				}
			}
		]
	},
	after() {
		assert.equal(runHooks.toString(2), '1111111');
	}
});
