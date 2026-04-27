const assert = require('assert');
const fooSource = './foo.js';

module.exports = defineTest({
	description: 'plugin context function works properly',
	options: {
		plugins: [
			{
				buildStart() {
					this.emitFile({
						type: 'chunk',
						id: 'emitted-chunk',
						attributes: {
							type: 'emit'
						}
					});
				},
				resolveId(id, _importer, { importerRawId, attributes }) {
					if (id === fooSource) {
						return this.resolve(
							id,
							{ rawId: importerRawId, attributes: { type: 'main' } },
							{ attributes }
						);
					}
					return id;
				},
				async load(_id, { rawId, attributes }) {
					if (attributes?.type === 'unchanged') {
						const info = await this.load({
							id: {
								rawId,
								attributes: {
									type: 'changed'
								}
							}
						});
						return info.code;
					}
					if (attributes?.type === 'changed') {
						return 'export const foo = "changed";';
					}
					if (attributes?.type === 'emit') {
						return 'export const emit = "emit";';
					}
				},
				renderStart() {
					const moduleInfo = this.getModuleInfo({
						rawId: fooSource,
						attributes: {
							type: 'changed'
						}
					});
					assert.equal(moduleInfo.id, './foo.js?type=changed');
				}
			},
			{
				resolveId(id, importer) {
					assert.ok(importer.endsWith('main'));
					return id;
				}
			}
		]
	}
});
