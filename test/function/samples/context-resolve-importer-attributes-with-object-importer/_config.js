const assert = require('node:assert');

module.exports = defineTest({
	description:
		'ignores the deprecated importerAttributes option of this.resolve when the importer is an object',
	options: {
		plugins: [
			{
				name: 'test',
				async buildStart() {
					await this.resolve(
						'target',
						{ attributes: { type: 'object' }, rawId: 'importer' },
						{
							importerAttributes: { type: 'option' }
						}
					);
				}
			},
			{
				name: 'observer',
				resolveId(source, importer, { importerAttributes, importerRawId }) {
					if (source === 'target') {
						assert.equal(importer, 'importer?attributes=%7B%22type%22%3A%22object%22%7D');
						assert.equal(importerRawId, 'importer');
						assert.deepEqual(importerAttributes, { type: 'object' });
					}
				}
			}
		]
	}
});
